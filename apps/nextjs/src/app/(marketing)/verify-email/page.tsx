import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { FilledButton } from "../_components/lab-ui";

export default async function VerifyEmailPage() {
  const session = await getSession();

  if (session) {
    redirect("/chat");
  }

  return (
    <section className="bg-abyssal-ink flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="border-lichen text-abyssal-ink bg-paper w-full max-w-[420px] rounded-[28px] border p-8 text-center md:p-10">
        <h1 className="text-[28px] leading-[1.1] tracking-[-0.03em]">
          Verification link expired
        </h1>
        <p className="text-graphite mt-4 text-[15px] leading-[1.5]">
          This verification link is invalid or has already been used. Sign in to
          request a new one, or create a new account.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <FilledButton href="/login" surface="light" className="w-full">
            Sign in
          </FilledButton>
          <Link
            href="/signup"
            className="text-graphite hover:text-abyssal-ink text-[14px] underline underline-offset-4 hover:no-underline"
          >
            Create a new account
          </Link>
        </div>
      </div>
    </section>
  );
}
