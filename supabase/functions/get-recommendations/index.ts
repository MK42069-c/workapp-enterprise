import { securityMiddleware } from '../_shared/security.ts';

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name, x-request-id, x-user-agent, x-forwarded-for',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: corsHeaders
        });
    }

    try {
        // Apply security middleware
        const securityCheck = securityMiddleware(req, {
            maxRequestsPerMinute: 60,
            requiredFields: ['userId'],
            validateUUID: true
        });

        if (!securityCheck.allowed) {
            return new Response(JSON.stringify(securityCheck.error), {
                status: 429,
                headers: { ...corsHeaders, ...securityCheck.headers, 'Content-Type': 'application/json' }
            });
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            return new Response(JSON.stringify({
                error: { code: 'CONFIG_ERROR', message: 'Missing Supabase configuration' }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        // Get request body
        const requestBody = await req.json();
        const { userId } = requestBody;

        // Get user's assessment results
        const assessmentResponse = await fetch(`${supabaseUrl}/rest/v1/assessment_results?user_id=eq.${userId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
                'apikey': serviceRoleKey,
            }
        });

        const assessmentResults = await assessmentResponse.json();
        
        // Get user's course history
        const enrollmentsResponse = await fetch(`${supabaseUrl}/rest/v1/course_enrollments?user_id=eq.${userId}&select=*,courses(*)`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
                'apikey': serviceRoleKey,
            }
        });

        const userEnrollments = await enrollmentsResponse.json();
        const enrolledCourseIds = userEnrollments.map((enrollment: any) => enrollment.course_id);

        // Get all available courses
        const coursesResponse = await fetch(`${supabaseUrl}/rest/v1/courses?select=*`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
                'apikey': serviceRoleKey,
            }
        });

        const allCourses = await coursesResponse.json();
        
        // Filter out already enrolled courses
        const availableCourses = allCourses.filter((course: any) => !enrolledCourseIds.includes(course.id));

        // Simple recommendation algorithm based on assessment results
        let recommendations = availableCourses;
        
        if (assessmentResults.length > 0) {
            const latestAssessment = assessmentResults[assessmentResults.length - 1];
            const personalityType = latestAssessment.result_data?.personality_type;
            
            // Adjust recommendations based on personality type
            if (personalityType) {
                recommendations = availableCourses.map((course: any) => {
                    let score = 0;
                    
                    // Base scoring based on course difficulty vs user level
                    const userLevel = latestAssessment.result_data?.learning_style || 'balanced';
                    
                    if (course.difficulty_level === 'beginner' && (userLevel === 'visual' || userLevel === 'hands-on')) {
                        score += 10;
                    } else if (course.difficulty_level === 'intermediate' && userLevel === 'analytical') {
                        score += 10;
                    } else if (course.difficulty_level === 'advanced' && userLevel === 'logical') {
                        score += 10;
                    }
                    
                    // Adjust based on course category
                    const courseCategory = course.category.toLowerCase();
                    if (personalityType.startsWith('IN') && courseCategory.includes('strategy')) {
                        score += 5;
                    } else if (personalityType.startsWith('ES') && courseCategory.includes('communication')) {
                        score += 5;
                    } else if (personalityType.includes('T') && courseCategory.includes('technical')) {
                        score += 5;
                    } else if (personalityType.includes('F') && courseCategory.includes('leadership')) {
                        score += 5;
                    }
                    
                    return { ...course, recommendationScore: score };
                });
                
                // Sort by recommendation score
                recommendations.sort((a: any, b: any) => b.recommendationScore - a.recommendationScore);
            }
        }

        // Return top 5 recommendations
        const topRecommendations = recommendations.slice(0, 5);
        
        return new Response(JSON.stringify({
            success: true,
            recommendations: topRecommendations,
            userContext: {
                assessmentCount: assessmentResults.length,
                enrolledCourses: userEnrollments.length,
                availableCourses: availableCourses.length
            }
        }), {
            headers: { ...corsHeaders, ...securityCheck.headers, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: { code: 'FUNCTION_ERROR', message: error.message }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});