import { randomUUID } from "crypto";

import { getSession } from "~/auth/server";
import { AuthShowcase } from "./_components/auth-showcase";
import { Chat } from "./_components/chat";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    return <AuthShowcase />;
  }

  // Pre-generate conversation ID for lazy creation on first message
  const conversationId = randomUUID();

  return <Chat conversationId={conversationId} initialMessages={[]} />;
}
