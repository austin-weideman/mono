interface CheckEmailPromptProps {
  email: string;
}

export function CheckEmailPrompt({ email }: CheckEmailPromptProps) {
  return (
    <div className="text-center">
      <div className="bg-frost border-lichen mx-auto mb-5 flex size-12 items-center justify-center rounded-full border">
        <MailIcon />
      </div>
      <h2 className="text-abyssal-ink text-[24px] tracking-[-0.02em]">
        Check your email
      </h2>
      <p className="text-graphite mt-3 text-[15px] leading-[1.5]">
        We sent a verification link to{" "}
        <span className="text-abyssal-ink">{email}</span>. Click the link to
        finish creating your account.
      </p>
      <p className="text-graphite mt-6 text-[13px] leading-[1.5]">
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
      className="text-abyssal-ink"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
