import type { Tool, UIMessageChunk } from "ai";
import { convertToModelMessages } from "ai";

import type { DbOrTx } from "@mono/db/client";

import type { CreateTurnAgent } from "../types/CreateTurnAgent";
import type { TurnLogger } from "../types/TurnLogger";
import type { TurnStepOutcome } from "../types/TurnStepOutcome";
import type { ToolCallResult } from "../utils/toolParts";
import { publishTurnEvent } from "../realtime/turnEvents";
import { messagesForModel } from "../utils/messages";
import { findPendingToolCalls, withToolResult } from "../utils/toolParts";
import { checkTurnStop, loadTurnState, saveTurnProgress } from "./turnState";

export interface RunToolStepInput {
  turnId: string;
  toolCallId: string;
  createAgent: CreateTurnAgent;
  logger: TurnLogger;
}

function isAsyncIterable(value: unknown): value is AsyncIterable<unknown> {
  return (
    typeof value === "object" && value !== null && Symbol.asyncIterator in value
  );
}

async function execute(
  tool: Tool | undefined,
  toolName: string,
  input: unknown,
  options: Parameters<NonNullable<Tool["execute"]>>[1],
): Promise<ToolCallResult> {
  if (!tool?.execute) {
    return { ok: false, errorText: `Unknown tool: ${toolName}` };
  }
  try {
    const result: unknown = await tool.execute(input, options);
    if (!isAsyncIterable(result)) return { ok: true, output: result };
    let output: unknown;
    for await (const value of result) output = value;
    return { ok: true, output };
  } catch (error) {
    return {
      ok: false,
      errorText: error instanceof Error ? error.message : String(error),
    };
  }
}

function resultChunk(
  toolCallId: string,
  result: ToolCallResult,
): UIMessageChunk {
  return result.ok
    ? { type: "tool-output-available", toolCallId, output: result.output }
    : { type: "tool-output-error", toolCallId, errorText: result.errorText };
}

// Executes one tool call the model made. Re-running it for the same
// toolCallId is a no-op once its result is saved.
export async function runToolStep(
  db: DbOrTx,
  input: RunToolStepInput,
): Promise<TurnStepOutcome> {
  const { turnId, toolCallId, createAgent, logger } = input;
  const startedAt = Date.now();

  const stop = await checkTurnStop(db, turnId);
  if (stop) return { kind: "stopped", reason: stop };

  const { turn, messages, assistantMessage } = await loadTurnState(db, turnId);
  const call = findPendingToolCalls(assistantMessage).find(
    (pending) => pending.toolCallId === toolCallId,
  );
  if (!call) return { kind: "done" };

  const agent = await createAgent(turn);
  try {
    const modelMessages = await convertToModelMessages(
      messagesForModel(messages),
      { tools: agent.tools, ignoreIncompleteToolCalls: true },
    );
    const result = await execute(
      agent.tools[call.toolName],
      call.toolName,
      call.input,
      { toolCallId, messages: modelMessages },
    );

    const lastEventId = await publishTurnEvent(turnId, {
      type: "chunks",
      chunks: [resultChunk(toolCallId, result)],
    });
    await saveTurnProgress(db, turn, {
      parts: withToolResult(assistantMessage.parts, toolCallId, result),
      lastEventId,
      completedModelSteps: turn.completedModelSteps,
    });

    logger.info("turn tool step finished", {
      turnId,
      conversationId: turn.conversationId,
      userId: turn.userId,
      agent: turn.agent,
      toolCallId,
      toolName: call.toolName,
      ok: result.ok,
      durationMs: Date.now() - startedAt,
    });
    return { kind: "done" };
  } finally {
    await agent.close();
  }
}
