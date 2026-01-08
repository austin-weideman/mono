import { tool } from "ai";
import { z } from "zod";

import { getMyUserInfo } from "@microlearn/user";

import type { ToolContext } from "../types";
import type { ToolMetadata } from "./types";

export const UserToolName = {
  GET_MY_USER_INFO: "getMyUserInfo",
} as const;

export type UserToolName = (typeof UserToolName)[keyof typeof UserToolName];

export const USER_TOOL_METADATA: Record<UserToolName, ToolMetadata> = {
  [UserToolName.GET_MY_USER_INFO]: {
    name: UserToolName.GET_MY_USER_INFO,
    description:
      "Get the current user's basic information including their name and email address.",
    usage:
      "Use when the user asks about their profile, name, identity, or email.",
  },
};

export function createUserTools(context: ToolContext) {
  return {
    [UserToolName.GET_MY_USER_INFO]: tool({
      description: USER_TOOL_METADATA[UserToolName.GET_MY_USER_INFO].description,
      inputSchema: z.object({}),
      execute: async () => {
        const userInfo = await getMyUserInfo(context.db, context.actor, {});
        return userInfo;
      },
    }),
  };
}
