import { notFound, redirect } from "next/navigation";

import { userActor } from "@microlearn/core-types";
import { loadConversation } from "@microlearn/conversation";
import { db } from "@microlearn/db/client";
import { NotFoundError } from "@microlearn/errors";

import { getSession } from "~/auth/server";
import { Chat } from "~/app/_components/chat";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const { id } = await params;

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

  return <Chat conversationId={conversation.id} initialMessages={messages} />;
}

