-- Migration: initial_schema
-- Created at: 1762122243

-- =====================================================
-- L&D Platform Database Schema
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
    manager_id UUID REFERENCES users(id),
    hire_date DATE,
    bio TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- User assessments table
CREATE TABLE user_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    assessment_type assessment_type NOT NULL,
    mbti_type mbti_type,
    mbti_confidence_score DECIMAL(3,2),
    tki_primary_mode tki_mode,
    tki_scores JSONB,
    raw_results JSONB,
    percentile_scores JSONB,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessment_version TEXT,
    is_valid BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category course_category NOT NULL,
    difficulty difficulty_level DEFAULT 'beginner',
    duration_minutes INTEGER,
    thumbnail_url TEXT,
    status course_status DEFAULT 'published',
    prerequisites TEXT[],
    key_skills TEXT[],
    learning_objectives TEXT[],
    certificate_name TEXT,
    provides_certificate BOOLEAN DEFAULT false,
    career_impact TEXT,
    target_users TEXT,
    instructor_name TEXT,
    instructor_bio TEXT,
    external_url TEXT,
    enrollment_count INTEGER DEFAULT 0,
    average_rating DECIMAL(2,1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id)
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    career_goals TEXT[],
    target_skills TEXT[],
    preferred_learning_pace learning_pace DEFAULT 'self_paced',
    available_hours_per_week INTEGER,
    notification_preferences JSONB,
    language_preference TEXT DEFAULT 'en',
    timezone_preference TEXT DEFAULT 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    status progress_status DEFAULT 'not_started',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    certificate_issued_at TIMESTAMP WITH TIME ZONE,
    certificate_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- AI Recommendations table
CREATE TABLE ai_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    recommendation_type recommendation_type DEFAULT 'course',
    reasoning TEXT,
    confidence_score DECIMAL(3,2),
    match_factors JSONB,
    based_on_mbti BOOLEAN DEFAULT false,
    based_on_tki BOOLEAN DEFAULT false,
    based_on_career_goals BOOLEAN DEFAULT false,
    based_on_progress BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    is_shown BOOLEAN DEFAULT false,
    shown_at TIMESTAMP WITH TIME ZONE,
    is_enrolled BOOLEAN DEFAULT false,
    enrolled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id, recommendation_type)
);

-- Learning paths
CREATE TABLE learning_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category course_category,
    difficulty_level difficulty_level DEFAULT 'beginner',
    estimated_duration_minutes INTEGER,
    target_audience TEXT,
    prerequisites TEXT[],
    learning_outcomes TEXT[],
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Learning path courses
CREATE TABLE learning_path_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    sequence_order INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(learning_path_id, course_id),
    UNIQUE(learning_path_id, sequence_order)
);

-- User learning paths
CREATE TABLE user_learning_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,
    status progress_status DEFAULT 'not_started',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    current_course_id UUID REFERENCES courses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, learning_path_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_experience_level ON users(experience_level);
CREATE INDEX idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX idx_user_assessments_type ON user_assessments(assessment_type);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_priority ON ai_recommendations(priority DESC);
CREATE INDEX idx_learning_path_courses_path_id ON learning_path_courses(learning_path_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_paths ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- User assessments policies
CREATE POLICY "Users can view their own assessments" ON user_assessments
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own assessments" ON user_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assessments" ON user_assessments
    FOR UPDATE USING (auth.uid() = user_id);

-- Courses policies
CREATE POLICY "Anyone can view published courses" ON courses
    FOR SELECT USING (status = 'published');

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- User progress policies
CREATE POLICY "Users can view their own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- AI recommendations policies
CREATE POLICY "Users can view their own recommendations" ON ai_recommendations
    FOR SELECT USING (auth.uid() = user_id);

-- Learning paths policies
CREATE POLICY "Anyone can view published learning paths" ON learning_paths
    FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view learning path courses" ON learning_path_courses
    FOR SELECT USING (true);

-- User learning paths policies
CREATE POLICY "Users can view their own learning paths" ON user_learning_paths
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own learning paths" ON user_learning_paths
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own learning paths" ON user_learning_paths
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_assessments_updated_at BEFORE UPDATE ON user_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_learning_paths_updated_at BEFORE UPDATE ON user_learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();