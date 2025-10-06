import { headers } from 'next/headers';

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Get client IP address from request
 */
export function getClientIp(): string {
  const headersList = headers();
  
  // Check various headers that might contain the real IP
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = headersList.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to localhost if no IP found
  return '127.0.0.1';
}

/**
 * Check if IP is whitelisted
 */
export function isIpWhitelisted(ip: string, whitelist: string[]): boolean {
  if (!whitelist || whitelist.length === 0) {
    return true; // No whitelist configured, allow all
  }
  
  return whitelist.some(allowedIp => {
    // Support CIDR notation (simplified - in production use proper CIDR library)
    if (allowedIp.includes('/')) {
      const [network] = allowedIp.split('/');
      return ip.startsWith(network.replace(/\.0+$/, ''));
    }
    
    // Support wildcards
    if (allowedIp.includes('*')) {
      const pattern = allowedIp.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(ip);
    }
    
    // Exact match
    return ip === allowedIp;
  });
}

/**
 * Check rate limit for an IP
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetAt: Date } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  
  // Clean up old entries
  if (entry && now - entry.firstRequest > windowMs) {
    rateLimitStore.delete(ip);
  }
  
  // Get or create entry
  const current = rateLimitStore.get(ip) || {
    count: 0,
    firstRequest: now,
    lastRequest: now
  };
  
  // Check if within window
  if (now - current.firstRequest <= windowMs) {
    current.count++;
    current.lastRequest = now;
    
    if (current.count > maxRequests) {
      const resetAt = new Date(current.firstRequest + windowMs);
      return {
        allowed: false,
        remaining: 0,
        resetAt
      };
    }
  } else {
    // New window
    current.count = 1;
    current.firstRequest = now;
    current.lastRequest = now;
  }
  
  rateLimitStore.set(ip, current);
  
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetAt: new Date(current.firstRequest + windowMs)
  };
}

/**
 * Block an IP temporarily
 */
const blockedIps = new Map<string, number>();

export function blockIp(ip: string, durationMs: number = 900000) { // 15 minutes default
  blockedIps.set(ip, Date.now() + durationMs);
}

export function isIpBlocked(ip: string): boolean {
  const blockedUntil = blockedIps.get(ip);
  
  if (!blockedUntil) {
    return false;
  }
  
  if (Date.now() > blockedUntil) {
    blockedIps.delete(ip);
    return false;
  }
  
  return true;
}

/**
 * Get geo location from IP (simplified - in production use a proper geo IP service)
 */
export async function getGeoLocation(ip: string): Promise<{ country?: string; city?: string }> {
  // For demo, just return a mock response
  // In production, use a service like MaxMind or IP2Location
  
  if (ip.startsWith('127.') || ip === '::1') {
    return { country: 'LOCAL', city: 'localhost' };
  }
  
  // You would call an API here
  // const response = await fetch(`https://ipapi.co/${ip}/json/`);
  // const data = await response.json();
  
  return {
    country: 'Unknown',
    city: 'Unknown'
  };
}

/**
 * Check if country is blocked
 */
export function isCountryBlocked(country: string, blockedCountries: string[]): boolean {
  if (!blockedCountries || blockedCountries.length === 0) {
    return false;
  }
  
  return blockedCountries.includes(country.toUpperCase());
}

/**
 * Cleanup expired rate limit entries (run periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now - entry.lastRequest > windowMs) {
      rateLimitStore.delete(ip);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof window === 'undefined') { // Only run on server
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
