import type { UIMessageChunk } from "ai";
import { Realtime } from "@upstash/realtime";
import { z } from "zod/v4";

import { redis } from "./redis";

const HISTORY_MAX_LENGTH = 50000;
const HISTORY_EXPIRE_SECS = 60 * 15;
const MAX_CONNECTION_DURATION_SECS = 300;

export const schema = {
  ai: {
    chunk: z.any() as z.ZodType<UIMessageChunk>,
  },
} as const;

export const realtime = new Realtime({
  redis,
  schema,
  maxDurationSecs: MAX_CONNECTION_DURATION_SECS,
  history: {
    maxLength: HISTORY_MAX_LENGTH,
    expireAfterSecs: HISTORY_EXPIRE_SECS,
  },
});
