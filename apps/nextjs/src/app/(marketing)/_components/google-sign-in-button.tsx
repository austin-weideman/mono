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
          "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium transition-all",
          variant === "primary" &&
            "bg-mauve hover:bg-mauve-dark text-white shadow-[0_18px_40px_rgba(58,24,40,0.22)] hover:shadow-[0_22px_50px_rgba(58,24,40,0.28)]",
          variant === "outline" &&
            "border-mauve/50 text-ink hover:bg-mauve/10 border-2",
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
