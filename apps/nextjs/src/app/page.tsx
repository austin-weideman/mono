import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { AuthShowcase } from "./_components/auth-showcase";

export default async function LandingPage() {
  const session = await getSession();

  if (session) {
    redirect("/chat");
  }

  return <AuthShowcase />;
}
