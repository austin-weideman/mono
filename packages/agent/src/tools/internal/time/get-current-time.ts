import { tool } from "ai";
import { z } from "zod";

import { formatFullDateTime, utcNow } from "@mono/time";
import { getMyUserInfo } from "@mono/user";

import type { ToolContext, ToolMetadata } from "../../../types";

const DEFAULT_TIMEZONE = "UTC";

export const GET_CURRENT_TIME_METADATA: ToolMetadata = {
  name: "getCurrentTime",
  description:
    "Get the current time formatted in the user's timezone, including time, AM/PM, timezone, day of week, month, day, and year.",
  usage:
    "Use when the user asks about the current time, date, day of the week, or what today is.",
};

export function createGetCurrentTimeTool(context: ToolContext) {
  return tool({
    description: GET_CURRENT_TIME_METADATA.description,
    inputSchema: z.object({}),
    execute: async () => {
      const userInfo = await getMyUserInfo(context.db, context.actor, {});
      const timezone = userInfo.timezone ?? DEFAULT_TIMEZONE;
      const now = utcNow();
      const formattedTime = formatFullDateTime(now, timezone);

      return { currentTime: formattedTime, timezone };
    },
  });
}
