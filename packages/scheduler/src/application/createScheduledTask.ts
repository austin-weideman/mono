import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { ActorType, isUserActor } from "@mono/core-types";
import { BadRequestError, ForbiddenError } from "@mono/errors";
import { isValidTimezone } from "@mono/time";

import type { CreateScheduledTaskInput } from "../types/CreateScheduledTaskInput";
import type { ScheduledTask } from "../types/ScheduledTask";
import { insertScheduledTask } from "../persistence/scheduled-task.mutations";
import { computeNextRun } from "../utils/computeNextRun";

export async function createScheduledTask(
  db: DbOrTx,
  actor: Actor,
  input: CreateScheduledTaskInput,
  now: Date,
): Promise<ScheduledTask> {
  if (input.actorType === ActorType.USER && !input.userId) {
    throw new BadRequestError("USER scheduled tasks must have a userId");
  }
  if (input.actorType === ActorType.SYSTEM && input.userId) {
    throw new BadRequestError("SYSTEM scheduled tasks must not have a userId");
  }

  if (isUserActor(actor)) {
    if (input.actorType !== ActorType.USER || input.userId !== actor.userId) {
      throw new ForbiddenError(
        "USER actors can only create their own USER scheduled tasks",
      );
    }
  }

  if (!isValidTimezone(input.timezone)) {
    throw new BadRequestError(`Invalid timezone: ${input.timezone}`);
  }

  const dtstart = input.dtstart ?? now;
  const probeAfter = dtstart.getTime() > now.getTime() ? dtstart : now;

  let nextRunAt: Date;
  try {
    const probe = computeNextRun({
      rrule: input.rrule,
      timezone: input.timezone,
      dtstart,
      after: probeAfter,
      inclusive: true,
    });
    if (!probe) {
      throw new BadRequestError(
        "rrule produces no occurrences from the requested start",
      );
    }
    nextRunAt = probe;
  } catch (err) {
    if (err instanceof BadRequestError) throw err;
    throw new BadRequestError(`Invalid rrule: ${(err as Error).message}`, {
      cause: err as Error,
    });
  }

  return await insertScheduledTask(db, {
    userId: input.userId ?? null,
    actorType: input.actorType,
    name: input.name,
    taskType: input.taskType,
    payload: input.payload,
    rrule: input.rrule,
    dtstart,
    timezone: input.timezone,
    nextRunAt,
  });
}
