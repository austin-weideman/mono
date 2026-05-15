import { del } from "@vercel/blob";

import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isSystemActor } from "@mono/core-types";
import { ForbiddenError } from "@mono/errors";

import {
  deleteAttachmentRow,
  selectOrphansOlderThan,
} from "../persistence/attachment.mutations";

const ORPHAN_AGE_MS = 24 * 60 * 60 * 1000;

export interface SweepOrphanAttachmentsResult {
  scanned: number;
  deleted: number;
  failed: number;
}

/**
 * Sweep attachments that were uploaded but never linked to a message within
 * 24h. The DB row is the only pointer back to the Blob, so we only delete the
 * row after `del()` succeeds — otherwise we'd lose the URL and leak the file
 * permanently. Failed rows stay in the table and get retried on the next sweep.
 */
export async function sweepOrphanAttachments(
  db: DbOrTx,
  actor: Actor,
  now: Date,
): Promise<SweepOrphanAttachmentsResult> {
  if (!isSystemActor(actor)) {
    throw new ForbiddenError("sweepOrphanAttachments requires a system actor");
  }

  const cutoff = new Date(now.getTime() - ORPHAN_AGE_MS);
  const orphans = await selectOrphansOlderThan(db, cutoff);

  let deleted = 0;
  let failed = 0;
  for (const row of orphans) {
    try {
      await del(row.blobUrl);
      await deleteAttachmentRow(db, row.id);
      deleted += 1;
    } catch (err) {
      failed += 1;
      console.error("sweepOrphanAttachments: del() failed", {
        attachmentId: row.id,
        pathname: row.pathname,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { scanned: orphans.length, deleted, failed };
}
