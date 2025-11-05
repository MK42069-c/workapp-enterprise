-- Migration: create_ld_platform_schema
-- Created at: 1762305298

-- =====================================================
-- L&D Platform Database Schema
-- Created: 2025-11-03
-- Description: Comprehensive schema for Learning & Development platform
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS AND TYPES
-- =====================================================

-- User assessment types
CREATE TYPE assessment_type AS ENUM ('mbti', 'tki', 'skills_assessment', 'learning_style');

-- MBTI personality types
CREATE TYPE mbti_type AS ENUM (
    'INTJ', 'INTP', 'ENTJ', 'ENTP', 
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
);

-- TKI conflict modes
CREATE TYPE tki_mode AS ENUM (
    'competing', 'collaborating', 'compromising', 
    'avoiding', 'accommodating'
);

-- Course categories and difficulty levels
CREATE TYPE course_category AS ENUM (
    'leadership', 'communication', 'technical', 'soft_skills',
    'project_management', 'data_analytics', 'digital_marketing',
    'finance', 'hr', 'operations', 'other'
);

CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Course status and progress
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');

CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused');

-- Recommendation types
CREATE TYPE recommendation_type AS ENUM ('course', 'learning_path', 'skill_boost', 'career_track');

-- User experience levels
CREATE TYPE experience_level AS ENUM ('entry', 'junior', 'mid', 'senior', 'executive');

-- Learning pace preferences
CREATE TYPE learning_pace AS ENUM ('self_paced', 'structured', 'intensive', 'adaptive');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    department TEXT,
    job_title TEXT,
    experience_level experience_level DEFAULT 'entry',
    manager_id UUID,
    hire_date DATE,
    bio TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- User assessments table (MBTI, TKI, etc.)
CREATE TABLE user_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    assessment_type assessment_type NOT NULL,
    
    -- MBTI specific fields
    mbti_type mbti_type,
    mbti_confidence_score DECIMAL(3,2),
    
    -- TKI specific fields  
    tki_primary_mode tki_mode,
    tki_scores JSONB,
    
    -- General assessment fields
    raw_results JSONB,
    percentile_scores JSONB,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessment_version TEXT,
    is_valid BOOLEAN DEFAULT true,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    category course_category NOT NULL,
    difficulty_level difficulty_level DEFAULT 'beginner',
    duration_minutes INTEGER,
    instructor_name TEXT,
    instructor_bio TEXT,
    thumbnail_url TEXT,
    content_url TEXT,
    content_type TEXT,
    status course_status DEFAULT 'draft',
    
    -- Metadata
    tags TEXT[],
    prerequisites TEXT[],
    learning_objectives TEXT[],
    skills_covered TEXT[],
    
    -- Engagement metrics
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_ratings INTEGER DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.0,
    
    -- Scheduling
    is_self_paced BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    registration_deadline DATE,
    
    -- AI and personalization
    ai_generated_summary TEXT,
    personalization_tags JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- User progress tracking
CREATE TABLE user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    
    -- Progress tracking
    status progress_status DEFAULT 'not_started',
    progress_percentage DECIMAL(5,2) DEFAULT 0.0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent_minutes INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    paused_at TIMESTAMP WITH TIME ZONE,
    
    -- Learning analytics
    current_module_id TEXT,
    bookmarked_sections TEXT[],
    notes TEXT,
    personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5),
    
    -- AI-powered insights
    ai_completion_prediction DECIMAL(3,2),
    ai_difficulty_match DECIMAL(3,2),
    recommended_pace TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, course_id)
);

-- AI-generated recommendations
CREATE TABLE recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    recommendation_type recommendation_type NOT NULL,
    
    -- Recommendation content
    title TEXT NOT NULL,
    description TEXT,
    recommended_courses UUID[],
    reasoning TEXT,
    
    -- Recommendation metadata
    priority_score DECIMAL(3,2) DEFAULT 0.0,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    target_completion_date DATE,
    
    -- Status tracking
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'completed', 'expired')),
    is_accepted BOOLEAN DEFAULT false,
    user_feedback INTEGER CHECK (user_feedback >= 1 AND user_feedback <= 5),
    feedback_text TEXT,
    
    -- AI algorithm metadata
    algorithm_version TEXT,
    input_features JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    generated_by UUID
);

-- User preferences and career goals
CREATE TABLE user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Career goals and aspirations
    career_goals TEXT[],
    target_roles TEXT[],
    industry_focus TEXT[],
    
    -- Learning preferences
    preferred_learning_pace learning_pace DEFAULT 'self_paced',
    preferred_content_types TEXT[],
    preferred_schedule JSONB,
    
    -- Skill development
    current_skills TEXT[],
    target_skills TEXT[],
    skill_priority JSONB,
    
    -- Personalization settings
    notification_preferences JSONB,
    learning_reminders BOOLEAN DEFAULT true,
    recommended_content_only BOOLEAN DEFAULT false,
    
    -- Time availability
    available_hours_per_week INTEGER DEFAULT 5,
    preferred_session_length INTEGER DEFAULT 30,
    
    -- Accessibility and accommodations
    accessibility_needs TEXT[],
    language_preference TEXT DEFAULT 'en',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID
);

-- Course ratings and reviews
CREATE TABLE course_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, course_id)
);

-- Learning paths and course sequences
CREATE TABLE learning_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category course_category,
    difficulty_level difficulty_level,
    
    -- Path metadata
    estimated_duration_hours INTEGER,
    is_ai_generated BOOLEAN DEFAULT false,
    created_by UUID,
    
    -- Certification
    provides_certificate BOOLEAN DEFAULT false,
    certificate_name TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning path course relationships
CREATE TABLE learning_path_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    
    sequence_order INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    estimated_hours INTEGER,
    
    UNIQUE(learning_path_id, course_id)
);

-- User learning path enrollments
CREATE TABLE user_learning_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,
    
    status progress_status DEFAULT 'not_started',
    progress_percentage DECIMAL(5,2) DEFAULT 0.0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    target_completion_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, learning_path_id)
);