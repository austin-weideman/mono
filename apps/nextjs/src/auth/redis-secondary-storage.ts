import "server-only";

import type { SecondaryStorage } from "@mono/auth";

import { redis } from "~/lib/rate-limit";

export const redisSecondaryStorage: SecondaryStorage = {
  async get(key) {
    const value = await redis.get(key);
    if (value === null || value === undefined) return null;
    if (typeof value === "string") return value;
    return JSON.stringify(value);
  },
  async set(key, value, ttl) {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    if (ttl) {
      await redis.set(key, stringValue, { ex: ttl });
    } else {
      await redis.set(key, stringValue);
    }
  },
  async delete(key) {
    await redis.del(key);
  },
};
