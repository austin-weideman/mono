import type { InngestFunction } from "inngest";

import { setActiveStream } from "@mono/conversation";
import { systemActor } from "@mono/core-types";
import { db } from "@mono/db/client";
import { inngest } from "@mono/jobs";
import { conversationRunScientistEvent } from "@mono/jobs/events/conversation";
import { streamChannel } from "@mono/realtime";

import { runScientistTurn } from "../application/runScientistTurn";

const SYSTEM_SERVICE = "experiment";

// Mirrors runAssistant: one agent turn inside one Inngest step, streaming chunks
// to the realtime channel keyed by streamId. retries:0 and per-conversation
// concurrency:1 match the assistant. In autonomous mode this single step runs
// the whole ~20-experiment loop — see the 300s-ceiling note in the plan.
const runScientistFn = inngest.createFunction(
  {
    id: "experiment-run-scientist",
    retries: 0,
    concurrency: { key: "event.data.conversationId", limit: 1 },
    triggers: [{ event: conversationRunScientistEvent }],
  },
  async ({ event, step }) => {
    const { conversationId, campaignId, userId, streamId, gatewayModelId } =
      event.data;
    const sysActor = systemActor(SYSTEM_SERVICE);
    const channel = streamChannel(streamId);

    await step.run("stream-scientist", async () => {
      try {
        await runScientistTurn(db, {
          campaignId,
          userId,
          gatewayModelId,
          onChunk: (chunk) => channel.emit("ai.chunk", chunk),
        });
      } catch (err) {
        const errorText = err instanceof Error ? err.message : String(err);
        await channel.emit("ai.chunk", { type: "error", errorText });
        throw err;
      } finally {
        try {
          await setActiveStream(db, sysActor, {
            conversationId,
            streamId: null,
          });
        } catch {
          // Conversation may have been archived or deleted mid-stream; swallow
          // so the original error (if any) propagates.
        }
      }
    });
  },
);

export const runScientist: InngestFunction.Any = runScientistFn;
