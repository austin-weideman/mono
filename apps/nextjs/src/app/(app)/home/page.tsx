import { SidebarTrigger } from "@mono/ui";

export default function HomePage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 px-4 py-3">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold">Home</h1>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="text-muted-foreground max-w-md text-center text-sm">
          Your dashboard will live here soon.
        </div>
      </div>
    </div>
  );
}
