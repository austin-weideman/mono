export const TaskType = {
  SCHEDULED_CHAT: "scheduled_chat",
} as const;

export type TaskType = (typeof TaskType)[keyof typeof TaskType];

export function isTaskType(value: string): value is TaskType {
  return Object.values(TaskType).includes(value as TaskType);
}
