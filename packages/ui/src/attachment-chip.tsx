"use client";

import { AlertTriangleIcon, CameraIcon, FileTextIcon, XIcon } from "./icons";
import { cn } from "./utils";

export type AttachmentChipState = "uploading" | "ready" | "failed";

interface AttachmentChipProps {
  filename: string;
  sizeBytes?: number;
  mediaType?: string;
  state: AttachmentChipState;
  progress?: number;
  onRemove?: () => void;
  onOpen?: () => void;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function labelFromMediaType(mediaType: string | undefined): string {
  if (!mediaType) return "File";
  if (mediaType === "application/pdf") return "PDF";
  if (mediaType.startsWith("image/")) {
    return mediaType.slice("image/".length).toUpperCase();
  }
  return "File";
}

function truncate(filename: string, max = 28): string {
  if (filename.length <= max) return filename;
  const dot = filename.lastIndexOf(".");
  if (dot === -1 || dot < filename.length - 6) {
    return filename.slice(0, max - 1) + "…";
  }
  const ext = filename.slice(dot);
  const stem = filename.slice(0, dot);
  return stem.slice(0, max - 1 - ext.length) + "…" + ext;
}

export function AttachmentChip({
  filename,
  sizeBytes,
  mediaType,
  state,
  progress,
  onRemove,
  onOpen,
  className,
}: AttachmentChipProps) {
  const isFailed = state === "failed";
  const isUploading = state === "uploading";
  const clickable = state === "ready" && !!onOpen;
  const isImage = mediaType?.startsWith("image/") ?? false;
  const Icon = isImage ? CameraIcon : FileTextIcon;

  const body = (
    <>
      <div
        className={cn(
          "bg-muted relative flex size-9 shrink-0 items-center justify-center rounded-md",
          isFailed && "bg-destructive/10",
        )}
      >
        {isFailed ? (
          <AlertTriangleIcon size={16} className="text-destructive" />
        ) : (
          <Icon
            size={16}
            className={cn("text-muted-foreground", isUploading && "opacity-50")}
          />
        )}
        {isUploading && (
          <div className="absolute inset-0 overflow-hidden rounded-md">
            <div
              className="bg-primary/20 absolute right-0 bottom-0 left-0 transition-[height] duration-150"
              style={{
                height: `${Math.max(4, Math.min(100, progress ?? 0))}%`,
              }}
            />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">
          {truncate(filename)}
        </span>
        <span
          className={cn(
            "text-muted-foreground text-xs",
            isFailed && "text-destructive",
          )}
        >
          {isFailed
            ? "Upload failed"
            : isUploading
              ? `Uploading… ${Math.round(progress ?? 0)}%`
              : sizeBytes !== undefined
                ? formatBytes(sizeBytes)
                : labelFromMediaType(mediaType)}
        </span>
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "border-border bg-background relative flex max-w-[15rem] items-center gap-2 rounded-lg border py-1.5 pr-3 pl-1.5",
        isFailed && "border-destructive/40",
        className,
      )}
    >
      {clickable ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
        >
          {body}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2">{body}</div>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove attachment"
          className="hover:bg-muted text-muted-foreground bg-background absolute -top-1.5 -right-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full border"
        >
          <XIcon size={12} />
        </button>
      )}
    </div>
  );
}
