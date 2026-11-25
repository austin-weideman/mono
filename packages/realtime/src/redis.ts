import { Redis } from "@upstash/redis";

import { env } from "@mono/env";

let client: Redis | null = null;

// Created on first use: build steps run without real secrets.
export function getRedis(): Redis {
  client ??= new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  return client;
}
