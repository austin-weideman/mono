import { redirect } from "next/navigation";

import { cn } from "@microlearn/ui";

import { auth } from "~/auth/server";

interface GoogleSignInButtonProps {
  variant?: "primary" | "ghost" | "outline";
  size?: "default" | "large";
  className?: string;
  children?: React.ReactNode;
}

export function GoogleSignInButton({
  variant = "primary",
  size = "default",
  className,
  children,
}: GoogleSignInButtonProps) {
  return (
    <form>
      <button
        type="submit"
        formAction={async () => {
          "use server";
          const res = await auth.api.signInSocial({
            body: {
              provider: "google",
              callbackURL: "/chat",
            },
          });
          if (!res.url) {
            throw new Error("No URL returned from signInSocial");
          }
          redirect(res.url);
        }}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-full font-medium",
          // Tactile feedback: subtle scale on hover/active + shadow boost.
          // Server-component-friendly (no framer-motion needed).
          "transition-[transform,background-color,box-shadow,border-color] duration-150 ease-out will-change-transform",
          "hover:scale-[1.03] active:scale-[0.97]",
          variant === "primary" &&
            "bg-obsidian text-eggshell border-obsidian hover:bg-cinder border hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]",
          (variant === "ghost" || variant === "outline") &&
            "bg-eggshell text-obsidian border-chalk hover:bg-powder border hover:shadow-[0_4px_12px_-6px_rgba(0,0,0,0.15)]",
          size === "default" && "h-9 px-4 text-[14px] leading-none",
          size === "large" && "h-11 px-6 text-[14px] leading-none",
          className,
        )}
      >
        {children ?? "Sign in with Google"}
      </button>
    </form>
  );
}
