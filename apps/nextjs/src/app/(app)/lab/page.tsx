import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { LabHome } from "./_components/lab-home";

export default async function LabPage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  return <LabHome />;
}
