"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  BorderBeam,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Separator,
  SidebarTrigger,
  Skeleton,
  Switch,
  toast,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@mono/ui";

export default function UiPlaygroundPage() {
  const [toggle, setToggle] = useState(false);
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  const [switchOn, setSwitchOn] = useState(false);
  const [switchSmOn, setSwitchSmOn] = useState(true);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-3">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold">UI Playground</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-10 pt-4">
          <Section
            title="Buttons"
            description="All variants and sizes from @mono/ui."
          >
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="icon">
                +
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </Section>

          <Section title="Toggle (stateful button)">
            <div className="flex items-center gap-3">
              <Button
                variant={toggle ? "default" : "outline"}
                onClick={() => setToggle((v) => !v)}
              >
                {toggle ? "On" : "Off"}
              </Button>
              <span className="text-muted-foreground text-sm">
                State: {String(toggle)}
              </span>
            </div>
          </Section>

          <Section title="Switch">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Switch
                  id="ui-playground-switch"
                  checked={switchOn}
                  onCheckedChange={setSwitchOn}
                />
                <Label htmlFor="ui-playground-switch">
                  {switchOn ? "Enabled" : "Disabled"}
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="ui-playground-switch-sm"
                  size="sm"
                  checked={switchSmOn}
                  onCheckedChange={setSwitchSmOn}
                />
                <Label htmlFor="ui-playground-switch-sm">Small</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="ui-playground-switch-disabled" disabled />
                <Label htmlFor="ui-playground-switch-disabled">Disabled</Label>
              </div>
            </div>
          </Section>

          <Section title="Counter">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCount((c) => c - 1)}
                aria-label="decrement"
              >
                −
              </Button>
              <span className="w-10 text-center font-mono text-sm">
                {count}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCount((c) => c + 1)}
                aria-label="increment"
              >
                +
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCount(0)}>
                Reset
              </Button>
            </div>
          </Section>

          <Section title="Inputs">
            <div className="flex max-w-sm flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ui-playground-text">Text input</Label>
                <Input
                  id="ui-playground-text"
                  placeholder="Type something…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                {text && (
                  <p className="text-muted-foreground text-xs">
                    You typed: {text}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ui-playground-disabled">Disabled</Label>
                <Input id="ui-playground-disabled" disabled value="locked" />
              </div>
            </div>
          </Section>

          <Section title="Toasts">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => toast("Default toast")}>
                Default
              </Button>
              <Button variant="outline" onClick={() => toast.success("Saved")}>
                Success
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.error("Something broke")}
              >
                Error
              </Button>
            </div>
          </Section>

          <Section title="Dropdown menu">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Open menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => toast("Clicked one")}>
                  Item one
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast("Clicked two")}>
                  Item two
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => toast.error("Deleted")}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Section>

          <Section title="Tooltip">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>I am a tooltip</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Section>

          <Section title="Alert dialog">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete something</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => toast.success("Deleted")}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Section>

          <Section title="Collapsible">
            <Collapsible className="max-w-sm">
              <CollapsibleTrigger asChild>
                <Button variant="outline">Toggle content</Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="text-muted-foreground mt-2 text-sm">
                Hidden content revealed.
              </CollapsibleContent>
            </Collapsible>
          </Section>

          <Section
            title="Border beam"
            description="Animated glow wrapper from border-beam."
          >
            <div className="flex flex-wrap gap-4">
              <BorderBeam>
                <div className="bg-card text-card-foreground rounded-2xl px-6 py-4 text-sm">
                  Default (colorful, md)
                </div>
              </BorderBeam>
              <BorderBeam colorVariant="ocean">
                <div className="bg-card text-card-foreground rounded-2xl px-6 py-4 text-sm">
                  Ocean
                </div>
              </BorderBeam>
              <BorderBeam colorVariant="sunset">
                <div className="bg-card text-card-foreground rounded-2xl px-6 py-4 text-sm">
                  Sunset
                </div>
              </BorderBeam>
              <BorderBeam colorVariant="mono">
                <div className="bg-card text-card-foreground rounded-2xl px-6 py-4 text-sm">
                  Mono
                </div>
              </BorderBeam>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <BorderBeam size="sm">
                <Button variant="outline">Small beam</Button>
              </BorderBeam>
              <BorderBeam size="line">
                <Input placeholder="Line beam under input" className="w-64" />
              </BorderBeam>
            </div>
          </Section>

          <Section title="Skeleton">
            <div className="flex max-w-sm flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Section>

          <Separator />

          <p className="text-muted-foreground text-xs">
            Internal playground — not linked from the app. Add new components
            here as they land.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-xs">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
