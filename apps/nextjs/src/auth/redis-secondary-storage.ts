import "server-only";

import type { SecondaryStorage } from "@mono/auth";
import { getRedis } from "@mono/realtime";

export const redisSecondaryStorage: SecondaryStorage = {
  async get(key) {
    const value = await getRedis().get(key);
    if (value === null || value === undefined) return null;
    if (typeof value === "string") return value;
    return JSON.stringify(value);
  },
  async set(key, value, ttl) {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    if (ttl) {
      await getRedis().set(key, stringValue, { ex: ttl });
    } else {
      await getRedis().set(key, stringValue);
    }
  },
  async delete(key) {
    await getRedis().del(key);
  },
};
