import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { AuthOrSeparator } from "../_components/auth-or-separator";
import { EmailPasswordForm } from "../_components/email-password-form";
import { GoogleSignInButton } from "../_components/google-sign-in-button";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/chat");
  }

  return (
    <section className="px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="mx-auto w-full max-w-[440px]">
        <header className="mb-10 text-center">
          <h1 className="text-obsidian font-display text-[32px] leading-[1.1] font-light tracking-[-0.64px]">
            Welcome back
          </h1>
          <p className="text-gravel mt-3 text-[15px] leading-[1.55]">
            Sign in to continue your daily five minutes.
          </p>
        </header>

        <div className="space-y-6">
          <GoogleSignInButton variant="ghost" size="large" className="w-full">
            Continue with Google
          </GoogleSignInButton>

          <AuthOrSeparator />

          <EmailPasswordForm mode="signin" />

          <p className="text-gravel text-center text-[14px]">
            New to MicroLearn?{" "}
            <Link
              href="/signup"
              className="text-obsidian underline underline-offset-4 hover:no-underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
