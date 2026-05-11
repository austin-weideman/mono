import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { ForbiddenError, NotFoundError } from "@mono/errors";

import type { GetMyUserInfoInput, UserInfo } from "../types";
import { getUserById } from "../persistence/user.queries";

export async function getMyUserInfo(
  db: DbOrTx,
  actor: Actor,
  _input: GetMyUserInfoInput,
): Promise<UserInfo> {
  if (!isUserActor(actor)) {
    throw new ForbiddenError("Only users can access their own user info");
  }

  const user = await getUserById(db, actor.userId);

  if (!user) {
    throw new NotFoundError(`User not found: ${actor.userId}`);
  }

  return {
    name: user.name,
    email: user.email,
    timezone: user.timezone,
  };
}
