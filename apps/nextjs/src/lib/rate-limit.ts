import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "@mono/env";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export const attachmentUploadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "5 m"),
  analytics: false,
  prefix: "rl:attachment-upload",
});
