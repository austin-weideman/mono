import { tool } from "ai";
import { z } from "zod";

import { getMyUserInfo } from "@mono/user";

import type { ToolContext, ToolMetadata } from "../../../types";

export const GET_MY_USER_INFO_METADATA: ToolMetadata = {
  name: "getMyUserInfo",
  description:
    "Get the current user's basic information including their name and email address.",
  usage:
    "Use when the user asks about their profile, name, identity, or email.",
};

export function createGetMyUserInfoTool(context: ToolContext) {
  return tool({
    description: GET_MY_USER_INFO_METADATA.description,
    inputSchema: z.object({}),
    execute: async () => {
      const userInfo = await getMyUserInfo(context.db, context.actor, {});
      return userInfo;
    },
  });
}
