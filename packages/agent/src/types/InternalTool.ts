export const InternalTool = {
  GET_MY_USER_INFO: "getMyUserInfo",
} as const;

export type InternalTool = (typeof InternalTool)[keyof typeof InternalTool];
