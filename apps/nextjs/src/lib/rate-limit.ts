import { Ratelimit } from "@upstash/ratelimit";

import { getRedis } from "@mono/realtime";

type RateLimitConfig = Omit<
  ConstructorParameters<typeof Ratelimit>[0],
  "redis" | "analytics"
>;

interface LazyRateLimit {
  limit: Ratelimit["limit"];
}

// Built on first use, so importing a route never needs Redis credentials.
function lazyRateLimit(config: RateLimitConfig): LazyRateLimit {
  let instance: Ratelimit | null = null;
  return {
    limit: (...args) => {
      instance ??= new Ratelimit({
        ...config,
        redis: getRedis(),
        analytics: false,
      });
      return instance.limit(...args);
    },
  };
}

export const attachmentUploadRateLimit = lazyRateLimit({
  limiter: Ratelimit.slidingWindow(30, "5 m"),
  prefix: "rl:attachment-upload",
});

export const chatBurstRateLimit = lazyRateLimit({
  limiter: Ratelimit.slidingWindow(4, "10 s"),
  prefix: "rl:chat-burst",
});

export const chatSustainedRateLimit = lazyRateLimit({
  limiter: Ratelimit.slidingWindow(30, "5 m"),
  prefix: "rl:chat-sustained",
});
