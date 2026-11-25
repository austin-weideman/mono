"use client";

import { AlertTriangleIcon, Button, RotateCcwIcon } from "@mono/ui";

import type { TurnOutcome } from "../../_lib/use-chat-turns";

interface TurnOutcomeNoticeProps {
  outcome: TurnOutcome;
  onRetry: () => void;
}

const OUTCOME_LABEL = {
  failed: "Something went wrong with this reply.",
  cancelled: "Stopped.",
} as const satisfies Record<TurnOutcome["status"], string>;

export function TurnOutcomeNotice({
  outcome,
  onRetry,
}: TurnOutcomeNoticeProps) {
  return (
    <div className="text-muted-foreground flex items-center gap-2 pl-9 text-sm">
      {outcome.status === "failed" && (
        <AlertTriangleIcon size={14} className="text-destructive" />
      )}
      <span>{OUTCOME_LABEL[outcome.status]}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRetry}
        className="cursor-pointer"
      >
        <RotateCcwIcon size={14} />
        Retry
      </Button>
    </div>
  );
}
