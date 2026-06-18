import { redirect } from "next/navigation";

import { cn } from "@mono/ui";

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
          "inline-flex cursor-pointer items-center justify-center rounded-lg border",
          // Tactile feedback: subtle scale on hover/active.
          // Server-component-friendly (no framer-motion needed).
          "transition-[transform,background-color,border-color] duration-150 ease-out will-change-transform",
          "hover:scale-[1.01] active:scale-[0.99]",
          variant === "primary" &&
            "bg-abyssal-ink text-paper border-abyssal-ink hover:bg-abyssal-ink/90",
          (variant === "ghost" || variant === "outline") &&
            "bg-paper text-abyssal-ink border-lichen hover:bg-frost",
          size === "default" && "h-9 px-4 text-[14px] leading-none",
          size === "large" && "h-11 px-6 text-[15px] leading-none",
          className,
        )}
      >
        {children ?? "Sign in with Google"}
      </button>
    </form>
  );
}
