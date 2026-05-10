interface CheckEmailPromptProps {
  email: string;
}

export function CheckEmailPrompt({ email }: CheckEmailPromptProps) {
  return (
    <div className="bg-eggshell border-chalk rounded-2xl border p-8 text-center">
      <div className="bg-powder border-chalk mx-auto mb-5 flex size-12 items-center justify-center rounded-full border">
        <MailIcon />
      </div>
      <h2 className="text-obsidian font-display text-[24px] font-light tracking-[-0.48px]">
        Check your email
      </h2>
      <p className="text-gravel mt-3 text-[15px] leading-[1.55]">
        We sent a verification link to{" "}
        <span className="text-obsidian font-medium">{email}</span>. Click the
        link to finish creating your account.
      </p>
      <p className="text-gravel mt-6 text-[13px] leading-[1.55]">
        Didn't get it? Check your spam folder, or wait a minute and try again.
      </p>
    </div>
  );
}

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-obsidian"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
