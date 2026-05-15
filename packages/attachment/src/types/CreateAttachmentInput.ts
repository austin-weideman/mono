import { z } from "zod";

export const createAttachmentInputSchema = z.object({
  id: z.uuid(),
  userId: z.string().min(1),
  conversationId: z.uuid().nullable(),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  blobUrl: z.url(),
  pathname: z.string().min(1),
});

export type CreateAttachmentInput = z.infer<typeof createAttachmentInputSchema>;
