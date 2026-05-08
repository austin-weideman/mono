import type { Actor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";
import { isUserActor } from "@microlearn/core-types";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@microlearn/errors";

import type { ResumeScheduledTaskInput } from "../types/ResumeScheduledTaskInput";
import type { ScheduledTask } from "../types/ScheduledTask";
import { updateScheduledTaskById } from "../persistence/scheduled-task.mutations";
import { getScheduledTaskById } from "../persistence/scheduled-task.queries";

export async function resumeScheduledTask(
  db: DbOrTx,
  actor: Actor,
  input: ResumeScheduledTaskInput,
  now: Date,
): Promise<ScheduledTask> {
  const existing = await getScheduledTaskById(db, input.id);
  if (!existing) {
    throw new NotFoundError(`Scheduled task not found: ${input.id}`);
  }
  if (isUserActor(actor) && existing.userId !== actor.userId) {
    throw new ForbiddenError("You do not have access to this scheduled task");
  }
  if (existing.status !== "paused") {
    throw new BadRequestError(
      `Cannot resume scheduled task with status '${existing.status}'`,
    );
  }

  // Prevent fire-storm on resume: never let nextRunAt land in the past.
  // Stale occurrences from the pause window are intentionally dropped
  // (best-effort delivery; see plan §"Downtime Semantics").
  const nextRunAt =
    existing.nextRunAt.getTime() > now.getTime() ? existing.nextRunAt : now;

  return await updateScheduledTaskById(db, input.id, {
    status: "active",
    nextRunAt,
  });
}
