import { del } from "@vercel/blob";

import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { BadRequestError, ForbiddenError, NotFoundError } from "@mono/errors";

import type { DeleteAttachmentInput } from "../types/DeleteAttachmentInput";
import { deleteAttachmentRow } from "../persistence/attachment.mutations";
import { getAttachmentById } from "../persistence/attachment.queries";

/**
 * Delete a pending (un-linked) attachment. Only allowed while
 * `messageId IS NULL` — once a message has been sent, the attachment is part
 * of conversation history and cannot be removed.
 */
export async function deleteAttachment(
  db: DbOrTx,
  actor: Actor,
  input: DeleteAttachmentInput,
): Promise<void> {
  if (!isUserActor(actor)) {
    throw new ForbiddenError("deleteAttachment requires a user actor");
  }

  const row = await getAttachmentById(db, input.attachmentId);
  if (!row) {
    throw new NotFoundError("Attachment not found");
  }
  if (row.userId !== actor.userId) {
    throw new ForbiddenError("Attachment does not belong to caller");
  }
  if (row.messageId !== null) {
    throw new BadRequestError("Cannot delete an attachment already sent");
  }

  await del(row.blobUrl);
  await deleteAttachmentRow(db, input.attachmentId);
}
