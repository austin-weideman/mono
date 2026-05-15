import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { BadRequestError, ForbiddenError } from "@mono/errors";

import type { LinkAttachmentsToMessageInput } from "../types/LinkAttachmentsToMessageInput";
import {
  linkAttachments,
  lockAttachmentsForLink,
} from "../persistence/attachment.mutations";

/**
 * Link uploaded attachments to a freshly persisted message. Trust boundary:
 * verifies every id belongs to the calling user and has no existing
 * messageId, atomically. Caller is responsible for running this inside the
 * same transaction as the `insertMessage` so the rows are linked or neither
 * exists.
 */
export async function linkAttachmentsToMessage(
  db: DbOrTx,
  actor: Actor,
  input: LinkAttachmentsToMessageInput,
): Promise<void> {
  if (!isUserActor(actor)) {
    throw new ForbiddenError("linkAttachmentsToMessage requires a user actor");
  }

  const rows = await lockAttachmentsForLink(db, input.attachmentIds);

  if (rows.length !== input.attachmentIds.length) {
    throw new BadRequestError("One or more attachments do not exist");
  }

  for (const row of rows) {
    if (row.userId !== actor.userId) {
      throw new ForbiddenError("Attachment does not belong to caller");
    }
    if (row.messageId !== null) {
      throw new BadRequestError("Attachment already linked to a message");
    }
  }

  await linkAttachments(db, {
    attachmentIds: input.attachmentIds,
    messageId: input.messageId,
    conversationId: input.conversationId,
  });
}
