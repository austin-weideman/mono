import type { HandleUploadBody } from "@vercel/blob/client";
import { headers } from "next/headers";
import { head } from "@vercel/blob";
import { handleUpload } from "@vercel/blob/client";
import { z } from "zod";

import { createAttachment } from "@mono/attachment";
import { systemActor } from "@mono/core-types";
import { db } from "@mono/db/client";

import { auth } from "~/auth/server";
import { attachmentUploadRateLimit } from "~/lib/rate-limit";

const ALLOWED_CONTENT_TYPES = ["application/pdf"] as const;
const MAX_BYTES = 32 * 1024 * 1024;
const TOKEN_VALID_MS = 30 * 60_000;
const SYSTEM_SERVICE = "attachment";

const clientPayloadSchema = z.object({
  attachmentId: z.uuid(),
});

const tokenPayloadSchema = z.object({
  attachmentId: z.uuid(),
  userId: z.string().min(1),
});

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request: req,
      // Auth + rate limit live INSIDE this callback so they only run on
      // token-request events. The `uploadCompleted` webhook is a
      // server-to-server call from Vercel — it carries no session cookie
      // and its authenticity is verified by handleUpload's HMAC signature
      // check, not by our session check.
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        if (!session?.user) {
          throw new Error("Authentication required");
        }

        const rl = await attachmentUploadRateLimit.limit(session.user.id);
        if (!rl.success) {
          throw new Error("Rate limit exceeded");
        }

        const parsed = clientPayloadSchema.parse(
          clientPayload ? JSON.parse(clientPayload) : {},
        );
        return {
          allowedContentTypes: [...ALLOWED_CONTENT_TYPES],
          maximumSizeInBytes: MAX_BYTES,
          validUntil: Date.now() + TOKEN_VALID_MS,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            attachmentId: parsed.attachmentId,
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload) return;
        const { attachmentId, userId } = tokenPayloadSchema.parse(
          JSON.parse(tokenPayload),
        );

        // PutBlobResult doesn't carry file size; head() is the canonical
        // source of truth.
        const meta = await head(blob.url);

        // conversationId is filled in later by linkAttachmentsToMessage —
        // the conversation row may not exist yet (new-chat flow uploads
        // before the first message is sent).
        await createAttachment(db, systemActor(SYSTEM_SERVICE), {
          id: attachmentId,
          userId,
          conversationId: null,
          filename: blob.pathname.split("/").pop() ?? "file.pdf",
          contentType: blob.contentType,
          sizeBytes: meta.size,
          blobUrl: blob.url,
          pathname: blob.pathname,
        });
      },
    });
    return Response.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
