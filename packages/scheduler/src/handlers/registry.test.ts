import { describe, expect, it } from "vitest";

import { TaskType } from "../types/TaskType";
import { getTaskHandler, taskHandlers } from "./registry";
import { scheduledChatHandler } from "./scheduled-chat.handler";

describe("taskHandlers registry", () => {
  it("resolves scheduled_chat to its handler", () => {
    expect(getTaskHandler(TaskType.SCHEDULED_CHAT)).toBe(scheduledChatHandler);
    expect(taskHandlers.scheduled_chat).toBe(scheduledChatHandler);
  });

  it("returns null for unknown task types", () => {
    expect(getTaskHandler("does_not_exist")).toBeNull();
  });

  it("each handler's taskType matches its registry key", () => {
    for (const [key, handler] of Object.entries(taskHandlers)) {
      expect(handler.taskType).toBe(key);
    }
  });
});

describe("scheduledChatHandler.payloadSchema", () => {
  it("accepts a valid payload", () => {
    const result = scheduledChatHandler.payloadSchema.safeParse({
      prompt: "Teach me EBITDA",
      gatewayModelId: "openai/gpt-4o",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty prompt", () => {
    const result = scheduledChatHandler.payloadSchema.safeParse({
      prompt: "",
      gatewayModelId: "openai/gpt-4o",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing gatewayModelId", () => {
    const result = scheduledChatHandler.payloadSchema.safeParse({
      prompt: "Teach me EBITDA",
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra unknown fields silently (Zod default strips them)", () => {
    const result = scheduledChatHandler.payloadSchema.safeParse({
      prompt: "Teach me EBITDA",
      gatewayModelId: "openai/gpt-4o",
      extra: "ignored",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("extra" in result.data).toBe(false);
    }
  });
});
