import { eq } from "drizzle-orm";

import type { DbOrTx } from "@mono/db/client";
import { attachment } from "@mono/db";

import type { Attachment } from "../types/Attachment";

export async function getAttachmentById(
  db: DbOrTx,
  attachmentId: string,
): Promise<Attachment | null> {
  const [row] = await db
    .select()
    .from(attachment)
    .where(eq(attachment.id, attachmentId))
    .limit(1);

  return row ?? null;
}
