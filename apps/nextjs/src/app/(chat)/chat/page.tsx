import { randomUUID } from "crypto";
import { cookies } from "next/headers";

import { getSelectedModelId } from "../_lib/model";
import { Chat } from "../../_components/chat";

export default async function NewChatPage() {
  const conversationId = randomUUID();
  const cookieStore = await cookies();
  const selectedModelId = getSelectedModelId(cookieStore);

  return (
    <Chat
      conversationId={conversationId}
      initialMessages={[]}
      selectedModelId={selectedModelId}
      isNew
    />
  );
}

