import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { BadRequestError, ForbiddenError } from "@mono/errors";
import { isValidTimezone } from "@mono/time";

import type { UpdateTimezoneInput } from "../types";
import { upsertUserProfile } from "../persistence/user-profile.mutations";

export async function updateMyTimezone(
  db: DbOrTx,
  actor: Actor,
  input: UpdateTimezoneInput,
): Promise<void> {
  if (!isUserActor(actor)) {
    throw new ForbiddenError("Only users can update their own timezone");
  }

  if (!isValidTimezone(input.timezone)) {
    throw new BadRequestError(`Invalid timezone: ${input.timezone}`);
  }

  await upsertUserProfile(db, actor.userId, { timezone: input.timezone });
}
