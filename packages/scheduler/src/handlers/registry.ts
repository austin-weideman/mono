import type { TaskHandler } from "../types/TaskHandler";
import type { TaskType } from "../types/TaskType";
import { scheduledChatHandler } from "./scheduled-chat.handler";

// `any` (not `unknown`) because each handler is invariant in its payload type:
// `TaskHandler<UserPayload>` is not assignable to `TaskHandler<unknown>`.
// Type safety comes from each handler's own Zod schema at the boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTaskHandler = TaskHandler<any>;

export const taskHandlers = {
  scheduled_chat: scheduledChatHandler,
} satisfies Record<TaskType, AnyTaskHandler>;

export function getTaskHandler(taskType: string): AnyTaskHandler | null {
  return (taskHandlers as Record<string, AnyTaskHandler>)[taskType] ?? null;
}
