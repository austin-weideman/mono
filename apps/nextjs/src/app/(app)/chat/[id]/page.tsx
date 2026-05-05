import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { loadConversation } from "@microlearn/conversation";
import { userActor } from "@microlearn/core-types";
import { db } from "@microlearn/db/client";
import { NotFoundError } from "@microlearn/errors";

import { Chat } from "~/app/_components/chat";
import { getSession } from "~/auth/server";
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

  try {
    const result = await loadConversation(db, userActor(session.user.id), {
      conversationId: id,
    });
    conversation = result.conversation;
    messages = result.messages;
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <Chat
      conversationId={conversation.id}
      initialMessages={messages}
      selectedModelId={selectedModelId}
      activeStreamId={conversation.activeStreamId}
    />
  );
}
