import { z } from "zod";

export const linkAttachmentsToMessageInputSchema = z.object({
  messageId: z.uuid(),
  conversationId: z.uuid(),
  attachmentIds: z.array(z.uuid()).min(1),
});

export type LinkAttachmentsToMessageInput = z.infer<
  typeof linkAttachmentsToMessageInputSchema
>;
