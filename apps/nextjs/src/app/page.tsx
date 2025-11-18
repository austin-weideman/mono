import { getSession } from "~/auth/server";
import { AuthShowcase } from "./_components/auth-showcase";
import { Chat } from "./_components/chat";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    return <AuthShowcase />;
  }

  return <Chat conversationId={null} initialMessages={[]} />;
}
