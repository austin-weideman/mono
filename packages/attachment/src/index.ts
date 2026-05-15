export type { Attachment } from "./types/Attachment";

export {
  createAttachmentInputSchema,
  type CreateAttachmentInput,
} from "./types/CreateAttachmentInput";

export {
  linkAttachmentsToMessageInputSchema,
  type LinkAttachmentsToMessageInput,
} from "./types/LinkAttachmentsToMessageInput";

export {
  deleteAttachmentInputSchema,
  type DeleteAttachmentInput,
} from "./types/DeleteAttachmentInput";

export { createAttachment } from "./application/createAttachment";
export { deleteAttachment } from "./application/deleteAttachment";
export { linkAttachmentsToMessage } from "./application/linkAttachmentsToMessage";
export { sweepOrphanAttachments } from "./application/sweepOrphanAttachments";
