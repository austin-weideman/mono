import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { AuthOrSeparator } from "../_components/auth-or-separator";
import { EmailPasswordForm } from "../_components/email-password-form";
import { GoogleSignInButton } from "../_components/google-sign-in-button";
import { PubTag } from "../_components/lab-ui";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/chat");
  }

  return (
    <section className="bg-abyssal-ink flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="border-lichen text-abyssal-ink bg-paper w-full max-w-[420px] rounded-[28px] border p-8 md:p-10">
        <header className="mb-8">
          <PubTag surface="light">Autolab</PubTag>
          <h1 className="mt-4 text-[32px] leading-[1.05] tracking-[-0.03em]">
            Welcome back
          </h1>
          <p className="text-graphite mt-2 text-[15px] leading-[1.5]">
            Sign in to your lab.
          </p>
        </header>

        <div className="space-y-6">
          <GoogleSignInButton variant="ghost" size="large" className="w-full">
            Continue with Google
          </GoogleSignInButton>

          <AuthOrSeparator />

          <EmailPasswordForm mode="signin" />

          <p className="text-graphite text-center text-[14px]">
            New to Autolab?{" "}
            <Link
              href="/signup"
              className="text-abyssal-ink underline underline-offset-4 hover:no-underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
