import { beforeEach, describe, expect, it, vi } from "vitest";

import { systemActor, userActor } from "@microlearn/core-types";
import { ForbiddenError } from "@microlearn/errors";

import type { HandlerContext } from "../types/TaskHandler";
import { scheduledChatHandler } from "./scheduled-chat.handler";

const sendMock = vi.hoisted(() =>
  // eslint-disable-next-line @typescript-eslint/require-await
  vi.fn(async (_event: unknown): Promise<void> => undefined),
);

vi.mock("@microlearn/jobs", () => ({
  inngest: {
    send: sendMock,
  },
}));

beforeEach(() => {
  sendMock.mockClear();
  // eslint-disable-next-line @typescript-eslint/require-await
  sendMock.mockImplementation(async () => undefined);
});

const fakeCtx = (overrides: Partial<HandlerContext> = {}): HandlerContext => ({
  // The handler never touches db; a stub is fine for unit-level coverage.
  db: {} as HandlerContext["db"],
  actor: userActor("user-1"),
  runId: "00000000-0000-0000-0000-000000000001",
  scheduledFor: new Date("2026-01-01T09:00:00Z"),
  ...overrides,
});

describe("scheduledChatHandler", () => {
  it("emits conversation/scheduled.start with userId from the actor", async () => {
    await scheduledChatHandler.execute(fakeCtx({ actor: userActor("u-42") }), {
      prompt: "Teach me EBITDA",
      gatewayModelId: "openai/gpt-4o",
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
    const sendArg = sendMock.mock.calls[0]?.[0] as {
      name: string;
      id: string;
      data: { userId: string; prompt: string; gatewayModelId: string };
    };
    expect(sendArg.name).toBe("conversation/scheduled.start");
    expect(sendArg.data).toEqual({
      userId: "u-42",
      prompt: "Teach me EBITDA",
      gatewayModelId: "openai/gpt-4o",
    });
  });

  it("uses runId as the Inngest event id for idempotency", async () => {
    const runId = "11111111-1111-1111-1111-111111111111";
    await scheduledChatHandler.execute(fakeCtx({ runId }), {
      prompt: "p",
      gatewayModelId: "m",
    });

    const sendArg = sendMock.mock.calls[0]?.[0] as { id: string };
    expect(sendArg.id).toBe(runId);
  });

  it("rejects SYSTEM-actor invocations", async () => {
    await expect(
      scheduledChatHandler.execute(
        fakeCtx({ actor: systemActor("scheduler") }),
        { prompt: "p", gatewayModelId: "m" },
      ),
    ).rejects.toThrow(ForbiddenError);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
