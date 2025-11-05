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
            requiredFields: ['userId', 'assessmentType', 'responses', 'resultData'],
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
        const { userId, assessmentType, responses, resultData } = requestBody;

        // Validate assessment type
        const validAssessmentTypes = ['mbti', 'tki', 'learning_style', 'career_interest'];
        if (!validAssessmentTypes.includes(assessmentType)) {
            return new Response(JSON.stringify({
                error: { code: 'INVALID_ASSESSMENT_TYPE', message: 'Invalid assessment type provided' }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Check if user already has a result for this assessment type
        const existingResultResponse = await fetch(`${supabaseUrl}/rest/v1/assessment_results?user_id=eq.${userId}&assessment_type=eq.${assessmentType}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
                'apikey': serviceRoleKey,
            }
        });

        const existingResults = await existingResultResponse.json();
        
        const assessmentData = {
            user_id: userId,
            assessment_type: assessmentType,
            responses: responses,
            result_data: resultData,
            completed_at: new Date().toISOString(),
            score: resultData?.score || null
        };

        let resultResponse;
        
        if (existingResults.length > 0) {
            // Update existing result
            resultResponse = await fetch(`${supabaseUrl}/rest/v1/assessment_results?id=eq.${existingResults[0].id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json',
                    'apikey': serviceRoleKey,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(assessmentData)
            });
        } else {
            // Create new result
            resultResponse = await fetch(`${supabaseUrl}/rest/v1/assessment_results`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json',
                    'apikey': serviceRoleKey,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(assessmentData)
            });
        }

        if (!resultResponse.ok) {
            const errorText = await resultResponse.text();
            return new Response(JSON.stringify({
                error: {
                    code: 'SAVE_FAILED',
                    message: `Failed to save assessment result: ${errorText}`,
                    details: { status: resultResponse.status }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        const result = await resultResponse.json();
        
        return new Response(JSON.stringify({
            success: true,
            message: `Assessment result saved successfully`,
            result: Array.isArray(result) ? result[0] : result
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