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
            maxRequestsPerMinute: 100,
            requiredFields: ['userId', 'courseId', 'progress'],
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
        const { userId, courseId, progress, completedLessons = [], currentLesson } = requestBody;

        // Validate progress percentage
        if (progress < 0 || progress > 100) {
            return new Response(JSON.stringify({
                error: { code: 'INVALID_PROGRESS', message: 'Progress must be between 0 and 100' }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Update enrollment progress
        const updateData = {
            progress_percentage: progress,
            last_accessed: new Date().toISOString(),
            completed_lessons: completedLessons,
            current_lesson: currentLesson
        };

        // Set status based on progress
        if (progress === 100) {
            updateData.status = 'completed';
            updateData.completed_at = new Date().toISOString();
        } else if (progress > 0) {
            updateData.status = 'active';
        }

        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/course_enrollments?user_id=eq.${userId}&course_id=eq.${courseId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
                'apikey': serviceRoleKey,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            return new Response(JSON.stringify({
                error: {
                    code: 'UPDATE_FAILED',
                    message: `Failed to update progress: ${errorText}`,
                    details: { status: updateResponse.status }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        const updatedEnrollment = await updateResponse.json();

        // If course is completed, award certificate (if not already awarded)
        if (progress === 100) {
            const certificateCheckResponse = await fetch(`${supabaseUrl}/rest/v1/certificates?user_id=eq.${userId}&course_id=eq.${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json',
                    'apikey': serviceRoleKey,
                }
            });

            const existingCertificates = await certificateCheckResponse.json();
            
            if (existingCertificates.length === 0) {
                // Generate certificate
                const certificateData = {
                    user_id: userId,
                    course_id: courseId,
                    certificate_url: `certificates/${userId}_${courseId}_${Date.now()}.pdf`,
                    issued_at: new Date().toISOString(),
                    is_verified: true
                };

                const certificateResponse = await fetch(`${supabaseUrl}/rest/v1/certificates`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'Content-Type': 'application/json',
                        'apikey': serviceRoleKey,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(certificateData)
                });

                if (certificateResponse.ok) {
                    const certificate = await certificateResponse.json();
                    return new Response(JSON.stringify({
                        success: true,
                        message: 'Progress updated and certificate issued!',
                        enrollment: updatedEnrollment[0],
                        certificate: certificate[0]
                    }), {
                        headers: { ...corsHeaders, ...securityCheck.headers, 'Content-Type': 'application/json' },
                    });
                }
            }
        }
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Progress updated successfully',
            enrollment: updatedEnrollment[0]
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