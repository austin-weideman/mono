import type { DbOrTx } from "@mono/db/client";

import type { CreateTurnAgent } from "../types/CreateTurnAgent";
import type { TurnLogger } from "../types/TurnLogger";
import type { TurnStepRunner } from "../types/TurnStepRunner";
import { beginTurn } from "./beginTurn";
import { endTurnAndNotify } from "./endTurn";
import { runModelStep } from "./runModelStep";
import { runToolStep } from "./runToolStep";

export interface RunChatTurnInput {
  turnId: string;
  createAgent: CreateTurnAgent;
  steps: TurnStepRunner;
  logger: TurnLogger;
}

type LoopResult = "completed" | "cancelled" | "gone";

// The agent loop as durable steps: each model call and each tool call is its
// own step, so a crash, timeout, or deploy resumes at the last finished one.
export async function runChatTurn(
  db: DbOrTx,
  input: RunChatTurnInput,
): Promise<void> {
  const { turnId, steps, logger } = input;

  const began = await steps.run("begin", () => beginTurn(db, turnId));
  if (!began) {
    logger.info("turn not runnable", { turnId });
    return;
  }

  const result = await runLoop(db, input);
  if (result === "gone") {
    logger.info("turn ended elsewhere", { turnId });
    return;
  }

  await steps.run("finish", async () => {
    await endTurnAndNotify(db, turnId, ["streaming"], { status: result });
    logger.info("turn finished", { turnId, status: result });
  });
}

async function runLoop(
  db: DbOrTx,
  input: RunChatTurnInput,
): Promise<LoopResult> {
  const { turnId, createAgent, steps, logger } = input;

  for (let index = 0; ; index++) {
    const model = await steps.run(`model-${index}`, () =>
      runModelStep(db, {
        turnId,
        index,
        attempt: steps.attempt,
        createAgent,
        logger,
      }),
    );
    switch (model.kind) {
      case "stopped":
        return model.reason;
      case "done":
        return "completed";
      case "tools":
        break;
    }

    for (const toolCallId of model.pendingToolCallIds) {
      const tool = await steps.run(`tool-${toolCallId}`, () =>
        runToolStep(db, { turnId, toolCallId, createAgent, logger }),
      );
      if (tool.kind === "stopped") return tool.reason;
    }

    if (model.stepLimitReached) return "completed";
  }
}
