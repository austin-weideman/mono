import { z } from "zod";

export const deleteAttachmentInputSchema = z.object({
  attachmentId: z.uuid(),
});

export type DeleteAttachmentInput = z.infer<typeof deleteAttachmentInputSchema>;
