import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { AuthOrSeparator } from "../_components/auth-or-separator";
import { EmailPasswordForm } from "../_components/email-password-form";
import { GoogleSignInButton } from "../_components/google-sign-in-button";

export default async function SignupPage() {
  const session = await getSession();

  if (session) {
    redirect("/chat");
  }

  return (
    <section className="px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="mx-auto w-full max-w-[440px]">
        <header className="mb-10 text-center">
          <h1 className="text-obsidian font-display text-[32px] leading-[1.1] font-light tracking-[-0.64px]">
            Start your daily five minutes
          </h1>
          <p className="text-gravel mt-3 text-[15px] leading-[1.55]">
            Create an account to begin learning.
          </p>
        </header>

        <div className="space-y-6">
          <GoogleSignInButton variant="ghost" size="large" className="w-full">
            Continue with Google
          </GoogleSignInButton>

          <AuthOrSeparator />

          <EmailPasswordForm mode="signup" />

          <p className="text-gravel text-center text-[14px]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-obsidian underline underline-offset-4 hover:no-underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
