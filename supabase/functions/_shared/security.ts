// Security middleware for Supabase Edge Functions
// Provides rate limiting, input validation, and security headers

export interface SecurityConfig {
  maxRequestsPerMinute?: number;
  maxRequestsPerHour?: number;
  requiredFields?: string[];
  optionalFields?: string[];
  validateEmail?: boolean;
  validateUUID?: boolean;
}

export interface RequestContext {
  userId?: string;
  ip?: string;
  userAgent?: string;
  rateLimitKey?: string;
}

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIp) return cfConnectingIp;
  if (xRealIp) return xRealIp;
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
  
  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Simple rate limiting check
 */
export function checkRateLimit(
  key: string, 
  config: SecurityConfig = {}
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const minuteLimit = config.maxRequestsPerMinute || 60;
  const hourLimit = config.maxRequestsPerHour || 1000;
  
  const existing = rateLimitStore.get(key);
  
  if (!existing) {
    const resetTime = now + (60 * 1000); // 1 minute
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: minuteLimit - 1, resetTime };
  }
  
  if (now > existing.resetTime) {
    // Reset for new window
    const resetTime = now + (60 * 1000);
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: minuteLimit - 1, resetTime };
  }
  
  if (existing.count >= minuteLimit) {
    return { allowed: false, remaining: 0, resetTime: existing.resetTime };
  }
  
  existing.count++;
  return { 
    allowed: true, 
    remaining: minuteLimit - existing.count, 
    resetTime: existing.resetTime 
  };
}

/**
 * Validate required fields in request body
 */
export function validateRequestBody(
  body: any, 
  config: SecurityConfig
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!body || typeof body !== 'object') {
    errors.push('Request body must be a valid JSON object');
    return { valid: false, errors };
  }
  
  // Check required fields
  if (config.requiredFields) {
    for (const field of config.requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }
  
  // Validate email if required
  if (config.validateEmail && body.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      errors.push('Invalid email format');
    }
  }
  
  // Validate UUID if required
  if (config.validateUUID && body.userId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.userId)) {
      errors.push('Invalid UUID format');
    }
  }
  
  // Sanitize string fields
  if (config.optionalFields || config.requiredFields) {
    const allFields = [...(config.requiredFields || []), ...(config.optionalFields || [])];
    for (const field of allFields) {
      if (body[field] && typeof body[field] === 'string') {
        // Basic XSS prevention
        body[field] = body[field]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Create security headers
 */
export function createSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
}

/**
 * Create rate limit headers
 */
export function createRateLimitHeaders(
  remaining: number, 
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': '60',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.floor(resetTime / 1000).toString(),
  };
}

/**
 * Comprehensive security check middleware
 */
export function securityMiddleware(
  request: Request,
  config: SecurityConfig = {}
): { context: RequestContext; allowed: boolean; headers: Record<string, string>; error?: any } {
  const headers: Record<string, string> = {
    ...createSecurityHeaders()
  };
  
  // Extract request context
  const context: RequestContext = {
    ip: getClientIP(request),
    userAgent: getUserAgent(request),
  };
  
  // Rate limiting
  const rateLimitKey = `${context.ip}:${context.userAgent}`;
  const rateLimit = checkRateLimit(rateLimitKey, config);
  
  if (!rateLimit.allowed) {
    const error = {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      }
    };
    
    headers['Retry-After'] = error.error.retryAfter.toString();
    headers['X-RateLimit-Remaining'] = '0';
    
    return { 
      context, 
      allowed: false, 
      headers: { ...headers, ...createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime) },
      error 
    };
  }
  
  // Add rate limit headers
  Object.assign(headers, createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime));
  
  return { context, allowed: true, headers };
}

/**
 * Handle security errors
 */
export function handleSecurityError(error: any, corsHeaders: Record<string, string>) {
  const securityHeaders = createSecurityHeaders();
  
  return new Response(JSON.stringify(error), {
    status: 429, // Too Many Requests
    headers: {
      ...corsHeaders,
      ...securityHeaders,
      'Retry-After': error.error?.retryAfter || '60'
    }
  });
}