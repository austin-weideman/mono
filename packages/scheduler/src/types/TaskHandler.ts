import type { z } from "zod";

import type { Actor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";

import type { TaskType } from "./TaskType";

export interface HandlerContext {
  db: DbOrTx;
  actor: Actor;
  runId: string;
  scheduledFor: Date;
}

export interface TaskHandler<TPayload> {
  taskType: TaskType;
  payloadSchema: z.ZodType<TPayload>;
  execute(ctx: HandlerContext, payload: TPayload): Promise<void>;
}
