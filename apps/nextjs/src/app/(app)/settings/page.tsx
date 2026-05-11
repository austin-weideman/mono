import { SidebarTrigger } from "@mono/ui";

import { getServerTrpc } from "~/trpc/server";
import { SetPasswordSection } from "./_components/set-password-section";

export default async function SettingsPage() {
  const trpc = await getServerTrpc();
  const { hasPassword } = await trpc.auth.hasPassword();

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 px-4 py-3">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>
      <div className="flex-1 overflow-y-auto px-4 pb-16">
        <div className="mx-auto w-full max-w-[560px] pt-8">
          <SetPasswordSection initialHasPassword={hasPassword} />
        </div>
      </div>
    </div>
  );
}
