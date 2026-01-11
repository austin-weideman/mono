export const InternalTool = {
  GET_MY_USER_INFO: "getMyUserInfo",
  GET_CURRENT_TIME: "getCurrentTime",
} as const;

export type InternalTool = (typeof InternalTool)[keyof typeof InternalTool];
