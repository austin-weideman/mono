import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isSystemActor } from "@mono/core-types";
import { ForbiddenError } from "@mono/errors";

import type { Attachment } from "../types/Attachment";
import type { CreateAttachmentInput } from "../types/CreateAttachmentInput";
import { insertAttachment } from "../persistence/attachment.mutations";

export async function createAttachment(
  db: DbOrTx,
  actor: Actor,
  input: CreateAttachmentInput,
): Promise<Attachment | null> {
  if (!isSystemActor(actor)) {
    throw new ForbiddenError(
      "createAttachment may only be invoked by a system actor",
    );
  }

  return await insertAttachment(db, input);
}
