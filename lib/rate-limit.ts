type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

type RateLimitConfig = {
  key: string;
  limit: number;
  windowMs: number;
};

const localStore = new Map<string, { count: number; resetAt: number }>();

function isUpstashConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function upstashRequest(body: unknown) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
  }

  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Upstash rate limit request failed with status ${response.status}`);
  }

  return response.json() as Promise<Array<{ result: number | null }>>;
}

async function distributedRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const now = Date.now();
  const resetAt = now + config.windowMs;
  const expirySeconds = Math.ceil(config.windowMs / 1000);

  const pipeline = await upstashRequest([
    ["INCR", config.key],
    ["EXPIRE", config.key, expirySeconds],
  ]);

  const count = Number(pipeline[0]?.result ?? 0);
  const allowed = count <= config.limit;

  return {
    allowed,
    remaining: Math.max(0, config.limit - count),
    resetAt,
  };
}

function localRateLimit(config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const existing = localStore.get(config.key);

  if (!existing || existing.resetAt < now) {
    localStore.set(config.key, { count: 1, resetAt: now + config.windowMs });
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt: now + config.windowMs,
    };
  }

  existing.count += 1;
  localStore.set(config.key, existing);

  return {
    allowed: existing.count <= config.limit,
    remaining: Math.max(0, config.limit - existing.count),
    resetAt: existing.resetAt,
  };
}

export async function runRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  if (isUpstashConfigured()) {
    return distributedRateLimit(config);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Distributed rate limiting is required in production. Configure Upstash credentials.");
  }

  return localRateLimit(config);
}
