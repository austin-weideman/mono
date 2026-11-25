import type { UIMessage } from "ai";
import { getToolName, isToolUIPart } from "ai";

export interface PendingToolCall {
  toolCallId: string;
  toolName: string;
  input: unknown;
}

export type ToolCallResult =
  | { ok: true; output: unknown }
  | { ok: false; errorText: string };

// Tool calls the model made that have not been executed yet.
export function findPendingToolCalls(message: UIMessage): PendingToolCall[] {
  return message.parts.flatMap((part) =>
    isToolUIPart(part) && part.state === "input-available"
      ? [
          {
            toolCallId: part.toolCallId,
            toolName: getToolName(part),
            input: part.input,
          },
        ]
      : [],
  );
}

export function withToolResult(
  parts: UIMessage["parts"],
  toolCallId: string,
  result: ToolCallResult,
): UIMessage["parts"] {
  return parts.map((part) => {
    if (!isToolUIPart(part) || part.toolCallId !== toolCallId) return part;
    const resolved = result.ok
      ? { ...part, state: "output-available" as const, output: result.output }
      : {
          ...part,
          state: "output-error" as const,
          errorText: result.errorText,
        };
    return resolved as UIMessage["parts"][number];
  });
}
