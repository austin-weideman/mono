import type { Actor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";
import { isUserActor } from "@microlearn/core-types";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@microlearn/errors";
import { isValidTimezone } from "@microlearn/time";

import type { ScheduledTask } from "../types/ScheduledTask";
import type { UpdateScheduledTaskInput } from "../types/UpdateScheduledTaskInput";
import { updateScheduledTaskById } from "../persistence/scheduled-task.mutations";
import { getScheduledTaskById } from "../persistence/scheduled-task.queries";
import { computeNextRun } from "../utils/computeNextRun";

export async function updateScheduledTask(
  db: DbOrTx,
  actor: Actor,
  input: UpdateScheduledTaskInput,
  now: Date,
): Promise<ScheduledTask> {
  const existing = await getScheduledTaskById(db, input.id);
  if (!existing) {
    throw new NotFoundError(`Scheduled task not found: ${input.id}`);
  }
  if (isUserActor(actor) && existing.userId !== actor.userId) {
    throw new ForbiddenError("You do not have access to this scheduled task");
  }

  const definitionChanged =
    input.rrule !== undefined ||
    input.timezone !== undefined ||
    input.dtstart !== undefined;

  const newRrule = input.rrule ?? existing.rrule;
  const newTimezone = input.timezone ?? existing.timezone;
  const newDtstart = input.dtstart ?? existing.dtstart;

  if (input.timezone !== undefined && !isValidTimezone(input.timezone)) {
    throw new BadRequestError(`Invalid timezone: ${input.timezone}`);
  }

  const patch: Parameters<typeof updateScheduledTaskById>[2] = {};
  if (input.rrule !== undefined) patch.rrule = input.rrule;
  if (input.timezone !== undefined) patch.timezone = input.timezone;
  if (input.dtstart !== undefined) patch.dtstart = input.dtstart;
  if (input.payload !== undefined) patch.payload = input.payload;

  if (definitionChanged) {
    let nextRun: Date | null;
    try {
      nextRun = computeNextRun({
        rrule: newRrule,
        timezone: newTimezone,
        dtstart: newDtstart,
        after: now,
        inclusive: true,
      });
    } catch (err) {
      throw new BadRequestError(`Invalid rrule: ${(err as Error).message}`, {
        cause: err as Error,
      });
    }
    if (!nextRun) {
      throw new BadRequestError("Updated rrule produces no future occurrences");
    }
    patch.nextRunAt = nextRun.getTime() > now.getTime() ? nextRun : now;
  }

  return await updateScheduledTaskById(db, input.id, patch);
}
