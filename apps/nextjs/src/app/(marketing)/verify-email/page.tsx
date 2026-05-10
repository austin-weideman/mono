import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";

export default async function VerifyEmailPage() {
  const session = await getSession();

  if (session) {
    redirect("/chat");
  }

  return (
    <section className="px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="mx-auto w-full max-w-[440px] text-center">
        <h1 className="text-obsidian font-display text-[32px] leading-[1.1] font-light tracking-[-0.64px]">
          Verification link expired
        </h1>
        <p className="text-gravel mt-4 text-[15px] leading-[1.55]">
          This verification link is invalid or has already been used. Sign in to
          request a new one, or create a new account.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/login"
            className="bg-obsidian text-eggshell hover:bg-cinder inline-flex h-11 items-center justify-center rounded-full px-6 text-[14px] font-medium transition-[transform,background-color,box-shadow] duration-150 ease-out hover:scale-[1.01] hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)] active:scale-[0.99]"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-gravel hover:text-obsidian text-[14px] underline underline-offset-4 hover:no-underline"
          >
            Create a new account
          </Link>
        </div>
      </div>
    </section>
  );
}
