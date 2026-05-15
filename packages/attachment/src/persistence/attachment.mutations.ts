import { and, eq, inArray, isNull, lt } from "drizzle-orm";

import type { DbOrTx } from "@mono/db/client";
import { attachment } from "@mono/db";

import type { Attachment } from "../types/Attachment";

export interface InsertAttachmentInput {
  id: string;
  userId: string;
  conversationId: string | null;
  filename: string;
  contentType: string;
  sizeBytes: number;
  blobUrl: string;
  pathname: string;
}

/**
 * Idempotent insert keyed on `pathname` — Vercel retries failed webhooks,
 * and we never want a duplicate row for the same Blob object.
 * Returns the row whether it was newly inserted or already present.
 */
export async function insertAttachment(
  db: DbOrTx,
  input: InsertAttachmentInput,
): Promise<Attachment | null> {
  const [row] = await db
    .insert(attachment)
    .values(input)
    .onConflictDoNothing({ target: attachment.pathname })
    .returning();

  if (row) return row;

  const [existing] = await db
    .select()
    .from(attachment)
    .where(eq(attachment.pathname, input.pathname))
    .limit(1);

  return existing ?? null;
}

export interface LinkAttachmentsRow {
  id: string;
  userId: string;
  messageId: string | null;
}

/**
 * Look up rows by id with `FOR UPDATE` so concurrent link attempts can't
 * double-attach the same attachment to two messages.
 */
export async function lockAttachmentsForLink(
  db: DbOrTx,
  attachmentIds: string[],
): Promise<LinkAttachmentsRow[]> {
  return await db
    .select({
      id: attachment.id,
      userId: attachment.userId,
      messageId: attachment.messageId,
    })
    .from(attachment)
    .where(inArray(attachment.id, attachmentIds))
    .for("update");
}

export async function linkAttachments(
  db: DbOrTx,
  input: {
    attachmentIds: string[];
    messageId: string;
    conversationId: string;
  },
): Promise<void> {
  await db
    .update(attachment)
    .set({
      messageId: input.messageId,
      conversationId: input.conversationId,
    })
    .where(inArray(attachment.id, input.attachmentIds));
}

export async function deleteAttachmentRow(
  db: DbOrTx,
  attachmentId: string,
): Promise<void> {
  await db.delete(attachment).where(eq(attachment.id, attachmentId));
}

export async function selectOrphansOlderThan(
  db: DbOrTx,
  olderThan: Date,
): Promise<Attachment[]> {
  return await db
    .select()
    .from(attachment)
    .where(
      and(isNull(attachment.messageId), lt(attachment.createdAt, olderThan)),
    );
}
