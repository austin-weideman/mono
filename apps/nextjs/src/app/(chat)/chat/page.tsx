import { randomUUID } from "crypto";

import { Chat } from "../../_components/chat";

export default function NewChatPage() {
  const conversationId = randomUUID();

  return <Chat conversationId={conversationId} initialMessages={[]} />;
}

