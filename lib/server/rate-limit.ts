interface Bucket {
  timestamps: number[];
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function createSlidingWindowLimiter(
  maxRequests = 20,
  windowMs = 60_000,
) {
  const buckets = new Map<string, Bucket>();

  return function checkLimit(key: string, now = Date.now()): RateLimitResult {
    const cutoff = now - windowMs;
    const entry = buckets.get(key) ?? {timestamps: []};
    const recent = entry.timestamps.filter((t) => t > cutoff);

    if (recent.length >= maxRequests) {
      const oldest = recent[0] ?? now;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      buckets.set(key, {timestamps: recent});
      return {allowed: false, remaining: 0, retryAfterSeconds};
    }

    recent.push(now);
    buckets.set(key, {timestamps: recent});
    if (buckets.size > 500) {
      for (const [k, v] of buckets.entries()) {
        if (v.timestamps.every((t) => t <= cutoff)) buckets.delete(k);
      }
    }
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - recent.length),
      retryAfterSeconds: 0,
    };
  };
}

export const aiRouteRateLimiter = createSlidingWindowLimiter(20, 60_000);
