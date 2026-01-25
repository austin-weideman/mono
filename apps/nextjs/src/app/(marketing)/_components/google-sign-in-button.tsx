import { redirect } from "next/navigation";

import { cn } from "@microlearn/ui";

import { auth } from "~/auth/server";
import { GoogleIcon } from "./icons";

interface GoogleSignInButtonProps {
  variant?: "primary" | "outline";
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
          "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-medium transition-all",
          variant === "primary" &&
            "bg-warm-amber hover:bg-warm-amber-dark text-white shadow-md hover:shadow-lg",
          variant === "outline" &&
            "border-warm-amber text-warm-amber hover:bg-warm-amber/10 border-2",
          size === "default" && "px-5 py-2.5 text-sm",
          size === "large" && "px-8 py-4 text-base",
          className,
        )}
      >
        <GoogleIcon className="size-5" />
        {children ?? "Sign in with Google"}
      </button>
    </form>
  );
}
