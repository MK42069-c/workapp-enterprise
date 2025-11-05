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
            maxRequestsPerMinute: 30,
            requiredFields: ['userId', 'courseId'],
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
        const { userId, courseId } = requestBody;

        // Check if user is already enrolled
        const checkEnrollmentResponse = await fetch(`${supabaseUrl}/rest/v1/course_enrollments?user_id=eq.${userId}&course_id=eq.${courseId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
                'apikey': serviceRoleKey,
            }
        });

        const existingEnrollments = await checkEnrollmentResponse.json();
        
        if (existingEnrollments.length > 0) {
            return new Response(JSON.stringify({
                error: { code: 'ALREADY_ENROLLED', message: 'User is already enrolled in this course' }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Create enrollment record
        const enrollmentData = {
            user_id: userId,
            course_id: courseId,
            enrolled_at: new Date().toISOString(),
            progress_percentage: 0,
            status: 'active'
        };

        const enrollmentResponse = await fetch(`${supabaseUrl}/rest/v1/course_enrollments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
                'apikey': serviceRoleKey,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(enrollmentData)
        });

        if (!enrollmentResponse.ok) {
            const errorText = await enrollmentResponse.text();
            return new Response(JSON.stringify({
                error: {
                    code: 'ENROLLMENT_FAILED',
                    message: `Failed to create enrollment: ${errorText}`,
                    details: { status: enrollmentResponse.status }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        const enrollmentResult = await enrollmentResponse.json();
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Successfully enrolled in course',
            enrollment: enrollmentResult[0]
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