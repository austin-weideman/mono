"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { upload } from "@vercel/blob/client";
import { AnimatePresence, motion } from "framer-motion";

import {
  AttachmentChip,
  AutoResizeTextarea,
  PaperclipIcon,
  popMotion,
  SendIcon,
  tactileMotion,
  toast,
} from "@mono/ui";

import { useTRPC } from "~/trpc/react";

export interface AttachmentDraft {
  id: string;
  filename: string;
  sizeBytes: number;
  contentType: string;
  url: string;
}

export type PendingAttachment =
  | {
      id: string;
      filename: string;
      contentType: string;
      file: File;
      state: "uploading";
      progress: number;
      abort: AbortController;
    }
  | {
      id: string;
      filename: string;
      contentType: string;
      sizeBytes: number;
      url: string;
      state: "ready";
    }
  | {
      id: string;
      filename: string;
      state: "failed";
      error: string;
    };

interface ChatInputProps {
  onSubmit: (text: string, attachments: AttachmentDraft[]) => void;
  disabled: boolean;
}

const ACCEPTED_TYPES_LIST = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
const ACCEPTED_TYPES = ACCEPTED_TYPES_LIST.join(",");
const ACCEPTED_TYPE_SET = new Set<string>(ACCEPTED_TYPES_LIST);
const MAX_BYTES = 32 * 1024 * 1024;
const MAX_ATTACHMENTS = 10;

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const trpc = useTRPC();
  const deleteAttachmentMutation = useMutation(
    trpc.attachment.delete.mutationOptions(),
  );

  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContainerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, textarea, input, a")) return;
    e.preventDefault();
    containerRef.current?.querySelector("textarea")?.focus();
  };

  const updateAttachment = (
    id: string,
    update: (prev: PendingAttachment) => PendingAttachment,
  ) => {
    setAttachments((prev) => prev.map((a) => (a.id === id ? update(a) : a)));
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const startUpload = async (file: File) => {
    if (!ACCEPTED_TYPE_SET.has(file.type)) {
      toast.error(`${file.name} is not a supported file type`);
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(`${file.name} is larger than 32 MB`);
      return;
    }

    const id = crypto.randomUUID();
    const abort = new AbortController();
    setAttachments((prev) => [
      ...prev,
      {
        id,
        filename: file.name,
        contentType: file.type,
        file,
        state: "uploading",
        progress: 0,
        abort,
      },
    ]);

    try {
      const result = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/attachments/upload",
        clientPayload: JSON.stringify({
          attachmentId: id,
        }),
        abortSignal: abort.signal,
        onUploadProgress: ({ percentage }) => {
          updateAttachment(id, (prev) =>
            prev.state === "uploading"
              ? { ...prev, progress: percentage }
              : prev,
          );
        },
      });

      updateAttachment(id, () => ({
        id,
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
        url: result.url,
        state: "ready",
      }));
    } catch (err) {
      if (abort.signal.aborted) {
        removeAttachment(id);
        return;
      }
      const message = err instanceof Error ? err.message : "Upload failed";
      updateAttachment(id, () => ({
        id,
        filename: file.name,
        state: "failed",
        error: message,
      }));
      toast.error(`Couldn't upload ${file.name}`);
    }
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      toast.error(`Up to ${MAX_ATTACHMENTS} PDFs per message`);
      e.target.value = "";
      return;
    }
    const picked = Array.from(files);
    if (picked.length > remaining) {
      toast.error(`Up to ${MAX_ATTACHMENTS} PDFs per message`);
    }
    picked.slice(0, remaining).forEach((f) => void startUpload(f));
    e.target.value = "";
  };

  const handleRemove = (item: PendingAttachment) => {
    if (item.state === "uploading") {
      item.abort.abort();
      removeAttachment(item.id);
      return;
    }
    if (item.state === "failed") {
      removeAttachment(item.id);
      return;
    }
    removeAttachment(item.id);
    deleteAttachmentMutation.mutate({ attachmentId: item.id });
  };

  const handleOpen = (item: PendingAttachment) => {
    if (item.state !== "ready") return;
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  const hasContent = input.trim().length > 0 || attachments.length > 0;
  const anyUploading = attachments.some((a) => a.state === "uploading");
  const anyFailed = attachments.some((a) => a.state === "failed");
  const sendDisabled = disabled || !hasContent || anyUploading || anyFailed;

  const handleSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (sendDisabled) return;
    const ready = attachments.filter(
      (a): a is Extract<PendingAttachment, { state: "ready" }> =>
        a.state === "ready",
    );
    onSubmit(
      input,
      ready.map((a) => ({
        id: a.id,
        filename: a.filename,
        sizeBytes: a.sizeBytes,
        contentType: a.contentType,
        url: a.url,
      })),
    );
    setInput("");
    setAttachments([]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex w-full flex-col gap-2"
    >
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {attachments.map((item) => (
            <AttachmentChip
              key={item.id}
              filename={item.filename}
              sizeBytes={item.state === "ready" ? item.sizeBytes : undefined}
              mediaType={item.state === "failed" ? undefined : item.contentType}
              state={item.state}
              progress={item.state === "uploading" ? item.progress : undefined}
              onRemove={() => handleRemove(item)}
              onOpen={() => handleOpen(item)}
            />
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        onMouseDown={handleContainerMouseDown}
        className="border-border bg-background focus-within:border-primary flex w-full cursor-text flex-col rounded-[1.25rem] border transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <AutoResizeTextarea
          value={input}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setInput(e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={disabled}
          placeholder="Write a message..."
          maxHeight={200}
          className="placeholder:text-muted-foreground px-4 pt-3 pb-1 text-base disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="flex items-center justify-between p-2">
          <button
            type="button"
            onClick={handleAttachClick}
            disabled={disabled || attachments.length >= MAX_ATTACHMENTS}
            aria-label="Attach PDF"
            className="text-muted-foreground hover:bg-muted flex size-8 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PaperclipIcon size={18} />
          </button>
          <AnimatePresence>
            {hasContent && (
              <motion.button
                key="send"
                type="submit"
                disabled={sendDisabled}
                aria-label="Send message"
                {...popMotion}
                {...tactileMotion}
                className="bg-primary text-primary-foreground flex size-8 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SendIcon />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </form>
  );
}
