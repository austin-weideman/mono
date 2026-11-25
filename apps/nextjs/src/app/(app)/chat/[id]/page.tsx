import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { loadConversation, toTurnSnapshot } from "@mono/conversation";
import { userActor } from "@mono/core-types";
import { db } from "@mono/db/client";
import { NotFoundError } from "@mono/errors";

import { getSession } from "~/auth/server";
import { Chat } from "../_components/chat";
import { getSelectedModelId } from "../../_lib/model";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const [session, cookieStore] = await Promise.all([getSession(), cookies()]);

  if (!session) {
    redirect("/");
  }

  const { id } = await params;
  const selectedModelId = getSelectedModelId(cookieStore);

  let conversation;
  let messages;
  let latestTurn;

  try {
    const result = await loadConversation(db, userActor(session.user.id), {
      conversationId: id,
    });
    conversation = result.conversation;
    messages = result.messages;
    latestTurn = result.latestTurn;
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <Chat
      key={conversation.id}
      conversationId={conversation.id}
      initialMessages={messages}
      selectedModelId={selectedModelId}
      initialTurn={latestTurn ? toTurnSnapshot(latestTurn) : null}
    />
  );
}
