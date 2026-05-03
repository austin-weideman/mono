import type { UIMessage } from "ai";
import type { InngestFunction } from "inngest";
import { convertToModelMessages } from "ai";

import { createAssistantAgent } from "@microlearn/agent";
import { systemActor, userActor } from "@microlearn/core-types";
import { db } from "@microlearn/db/client";
import { inngest } from "@microlearn/jobs";
import { streamChannel } from "@microlearn/realtime";

import type { Message } from "../types/Message";
import { loadConversation } from "../application/loadConversation";
import { sendMessage } from "../application/sendMessage";
import { setActiveStream } from "../application/setActiveStream";
import { conversationRunAssistantEvent } from "./events";

const SYSTEM_SERVICE = "conversation";

function toUIMessages(messages: Message[]): UIMessage[] {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: msg.parts,
  }));
}

const runAssistantFn = inngest.createFunction(
  {
    id: "conversation-run-assistant",
    retries: 0,
    concurrency: { key: "event.data.conversationId", limit: 1 },
    triggers: [{ event: conversationRunAssistantEvent }],
  },
  async ({ event, step }) => {
    const { conversationId, userId, streamId, gatewayModelId } = event.data;
    const sysActor = systemActor(SYSTEM_SERVICE);
    const usrActor = userActor(userId);
    const channel = streamChannel(streamId);

    await step.run("stream-agent", async () => {
      const { messages: dbMessages } = await loadConversation(db, sysActor, {
        conversationId,
      });

      const { agent, close } = createAssistantAgent({
        gatewayModelId,
        context: { db, actor: usrActor },
      });

      const uiMessages = toUIMessages(dbMessages);

      try {
        const result = await agent.stream({
          messages: await convertToModelMessages(uiMessages),
        });

        const stream = result.toUIMessageStream({
          generateMessageId: () => crypto.randomUUID(),
          sendReasoning: true,
          onFinish: async ({ messages, isAborted }) => {
            if (isAborted) return;
            const last = messages[messages.length - 1];
            if (last?.role === "assistant") {
              await sendMessage(db, sysActor, {
                conversationId,
                role: "assistant",
                parts: last.parts,
              });
            }
          },
        });

        for await (const chunk of stream) {
          await channel.emit("ai.chunk", chunk);
        }
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
          // Conversation may have been archived or deleted mid-stream;
          // swallow so the original error (if any) propagates.
        }
        await close();
      }
    });
  },
);

export const runAssistant: InngestFunction.Any = runAssistantFn;
