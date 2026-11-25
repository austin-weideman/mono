"use client";

import type { ChatStatus, UIMessage, UIMessageChunk } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { readUIMessageStream } from "ai";

import type {
  ChatTurnStatus,
  TerminalTurnStatus,
  TurnEvent,
  TurnSnapshot,
} from "@mono/conversation";
import { toast } from "@mono/ui";

import { useTRPC } from "~/trpc/react";

const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 10_000;
const HTTP_CONFLICT = 409;
const HTTP_TOO_MANY_REQUESTS = 429;

export interface TurnOutcome {
  turnId: string;
  assistantMessageId: string;
  status: Extract<TerminalTurnStatus, "failed" | "cancelled">;
}

interface ActiveTurn {
  id: string;
  assistantMessageId: string;
}

interface Connection {
  turn: ActiveTurn;
  source: EventSource | null;
  feed: ReadableStreamDefaultController<UIMessageChunk> | null;
  lastEventId: string | null;
  reconnectAttempt: number;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
}

export interface UseChatTurnsOptions {
  conversationId: string;
  initialMessages: UIMessage[];
  initialTurn: TurnSnapshot | null;
  onEvent?: (event: TurnEvent) => void;
}

export interface ChatTurns {
  messages: UIMessage[];
  status: ChatStatus;
  outcome: TurnOutcome | null;
  isStopping: boolean;
  send: (parts: UIMessage["parts"], attachmentIds: string[]) => Promise<void>;
  stop: () => void;
  retry: () => Promise<void>;
}

function toOutcome(
  turn: ActiveTurn,
  status: TerminalTurnStatus,
): TurnOutcome | null {
  switch (status) {
    case "completed":
      return null;
    case "failed":
    case "cancelled":
      return {
        turnId: turn.id,
        assistantMessageId: turn.assistantMessageId,
        status,
      };
  }
}

function initialOutcome(turn: TurnSnapshot | null): TurnOutcome | null {
  const status = turn ? terminalStatus(turn.status) : null;
  return turn && status ? toOutcome(turn, status) : null;
}

function terminalStatus(status: ChatTurnStatus): TerminalTurnStatus | null {
  switch (status) {
    case "queued":
    case "streaming":
      return null;
    case "completed":
    case "failed":
    case "cancelled":
      return status;
  }
}

function isActive(turn: TurnSnapshot | null): turn is TurnSnapshot {
  return turn !== null && terminalStatus(turn.status) === null;
}

function emptyAssistantMessage(id: string): UIMessage {
  return { id, role: "assistant", parts: [] };
}

function sendErrorMessage(status: number): string {
  if (status === HTTP_CONFLICT) return "A reply is already in progress.";
  if (status === HTTP_TOO_MANY_REQUESTS)
    return "Too many messages. Try again shortly.";
  return "Couldn't send your message.";
}

// One conversation's messages and its live turn: sends messages, streams the
// reply from the turn's event log, resumes after reloads and dropped
// connections, and stops or retries replies.
export function useChatTurns(options: UseChatTurnsOptions): ChatTurns {
  const { conversationId, initialTurn } = options;
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const cancelMutation = useMutation(
    trpc.conversation.cancelTurn.mutationOptions(),
  );

  const [messages, setMessages] = useState<UIMessage[]>(
    options.initialMessages,
  );
  const [status, setStatus] = useState<ChatStatus>(() => {
    if (!isActive(initialTurn)) return "ready";
    const assistant = options.initialMessages.find(
      (message) => message.id === initialTurn.assistantMessageId,
    );
    return assistant?.parts.length ? "streaming" : "submitted";
  });
  const [outcome, setOutcome] = useState<TurnOutcome | null>(() =>
    initialOutcome(initialTurn),
  );
  const [isStopping, setIsStopping] = useState(false);

  const messagesRef = useRef(messages);
  const connectionRef = useRef<Connection | null>(null);
  const onEventRef = useRef(options.onEvent);
  useEffect(() => {
    onEventRef.current = options.onEvent;
  }, [options.onEvent]);

  const upsertMessage = useCallback((message: UIMessage) => {
    setMessages((previous) => {
      const index = previous.findIndex((m) => m.id === message.id);
      const next =
        index === -1
          ? [...previous, message]
          : previous.map((m, i) => (i === index ? message : m));
      messagesRef.current = next;
      return next;
    });
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages((previous) => {
      const next = previous.filter((m) => m.id !== messageId);
      messagesRef.current = next;
      return next;
    });
  }, []);

  const disconnect = useCallback(() => {
    const connection = connectionRef.current;
    if (!connection) return;
    connectionRef.current = null;
    connection.source?.close();
    if (connection.reconnectTimer) clearTimeout(connection.reconnectTimer);
    try {
      connection.feed?.close();
    } catch {
      // already closed
    }
  }, []);

  const startFeed = useCallback(
    (connection: Connection, base: UIMessage): void => {
      try {
        connection.feed?.close();
      } catch {
        // already closed
      }
      let feed: ReadableStreamDefaultController<UIMessageChunk> | null = null;
      const stream = new ReadableStream<UIMessageChunk>({
        start: (controller) => {
          feed = controller;
        },
      });
      connection.feed = feed;
      void (async () => {
        for await (const message of readUIMessageStream({
          message: base,
          stream,
          onError: () => undefined,
        })) {
          upsertMessage(message);
          if (connectionRef.current === connection) setStatus("streaming");
        }
      })();
    },
    [upsertMessage],
  );

  const finish = useCallback(
    (connection: Connection, endStatus: TerminalTurnStatus) => {
      if (connectionRef.current !== connection) return;
      disconnect();
      setStatus("ready");
      setIsStopping(false);
      setOutcome(toOutcome(connection.turn, endStatus));
    },
    [disconnect],
  );

  const open = useCallback(
    (connection: Connection) => {
      const query = connection.lastEventId
        ? `?after=${encodeURIComponent(connection.lastEventId)}`
        : "";
      const source = new EventSource(
        `/api/chat/turns/${connection.turn.id}/stream${query}`,
      );
      connection.source = source;

      source.onmessage = (message: MessageEvent<string>) => {
        if (connectionRef.current !== connection) return;
        if (message.lastEventId) connection.lastEventId = message.lastEventId;
        connection.reconnectAttempt = 0;
        const event = JSON.parse(message.data) as TurnEvent;
        onEventRef.current?.(event);
        switch (event.type) {
          case "chunks":
            for (const chunk of event.chunks) connection.feed?.enqueue(chunk);
            return;
          case "reset":
            upsertMessage(event.message);
            startFeed(connection, event.message);
            return;
          case "end":
            finish(connection, event.status);
            return;
        }
      };

      // A closed source means the server refused the request; anything else is
      // EventSource's own reconnect with Last-Event-ID.
      source.onerror = () => {
        if (source.readyState !== EventSource.CLOSED) return;
        if (connectionRef.current !== connection) return;
        void (async () => {
          try {
            const turn = await queryClient.fetchQuery({
              ...trpc.conversation.getTurn.queryOptions({
                turnId: connection.turn.id,
              }),
              staleTime: 0,
            });
            const ended = terminalStatus(turn.status);
            if (ended) {
              finish(connection, ended);
              return;
            }
          } catch {
            // fall through to a backed-off reconnect
          }
          if (connectionRef.current !== connection) return;
          const delay = Math.min(
            RECONNECT_BASE_MS * 2 ** connection.reconnectAttempt,
            RECONNECT_MAX_MS,
          );
          connection.reconnectAttempt++;
          connection.reconnectTimer = setTimeout(() => {
            if (connectionRef.current === connection) open(connection);
          }, delay);
        })();
      };
    },
    [finish, queryClient, startFeed, trpc.conversation.getTurn, upsertMessage],
  );

  const follow = useCallback(
    (turn: ActiveTurn, afterEventId: string | null) => {
      disconnect();
      const connection: Connection = {
        turn,
        source: null,
        feed: null,
        lastEventId: afterEventId,
        reconnectAttempt: 0,
        reconnectTimer: null,
      };
      connectionRef.current = connection;
      const base =
        messagesRef.current.find((m) => m.id === turn.assistantMessageId) ??
        emptyAssistantMessage(turn.assistantMessageId);
      startFeed(connection, base);
      open(connection);
    },
    [disconnect, open, startFeed],
  );

  useEffect(() => {
    if (isActive(initialTurn)) {
      follow(initialTurn, initialTurn.persistedEventId);
    }
    return disconnect;
  }, [conversationId, initialTurn, follow, disconnect]);

  const startTurn = useCallback(
    async (body: Record<string, unknown>): Promise<TurnSnapshot | null> => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => null);
      if (!response?.ok) {
        toast.error(sendErrorMessage(response?.status ?? 0));
        return null;
      }
      const { turn } = (await response.json()) as { turn: TurnSnapshot };
      return turn;
    },
    [],
  );

  const send = useCallback(
    async (parts: UIMessage["parts"], attachmentIds: string[]) => {
      const userMessage: UIMessage = {
        id: crypto.randomUUID(),
        role: "user",
        parts,
      };
      upsertMessage(userMessage);
      setOutcome(null);
      setStatus("submitted");

      const turn = await startTurn({
        kind: "send",
        conversationId,
        turnId: crypto.randomUUID(),
        message: { id: userMessage.id, parts },
        attachmentIds,
      });
      if (!turn) {
        removeMessage(userMessage.id);
        setStatus("ready");
        return;
      }
      follow(turn, null);
    },
    [conversationId, follow, removeMessage, startTurn, upsertMessage],
  );

  const retry = useCallback(async () => {
    if (!outcome) return;
    const previous = outcome;
    setOutcome(null);
    setStatus("submitted");

    const turn = await startTurn({
      kind: "retry",
      turnId: crypto.randomUUID(),
      retryOfTurnId: previous.turnId,
    });
    if (!turn) {
      setOutcome(previous);
      setStatus("ready");
      return;
    }
    removeMessage(previous.assistantMessageId);
    follow(turn, null);
  }, [follow, outcome, removeMessage, startTurn]);

  const stop = useCallback(() => {
    const connection = connectionRef.current;
    if (!connection) return;
    setIsStopping(true);
    cancelMutation.mutate(
      { turnId: connection.turn.id },
      {
        onError: () => {
          setIsStopping(false);
          toast.error("Couldn't stop the reply.");
        },
      },
    );
  }, [cancelMutation]);

  const visibleMessages = useMemo(
    () =>
      messages.filter(
        (message) => message.role !== "assistant" || message.parts.length > 0,
      ),
    [messages],
  );

  return {
    messages: visibleMessages,
    status,
    outcome,
    isStopping,
    send,
    stop,
    retry,
  };
}
