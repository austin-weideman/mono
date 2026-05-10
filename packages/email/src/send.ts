import type { ReactElement } from "react";
import { Resend } from "resend";

import { env } from "@microlearn/env";
import { InternalServerError } from "@microlearn/errors";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string | string[];
  idempotencyKey?: string;
  tags?: Record<string, string>;
}

export interface SendEmailResult {
  id: string;
}

let client: Resend | null = null;

function getClient(): Resend {
  client ??= new Resend(env.RESEND_API_KEY);
  return client;
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const response = await getClient().emails.send(
    {
      from: input.from ?? env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      react: input.react,
      replyTo: input.replyTo,
      tags: input.tags
        ? Object.entries(input.tags).map(([name, value]) => ({ name, value }))
        : undefined,
    },
    input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
  );

  if (response.error !== null) {
    throw new InternalServerError("Failed to send email", {
      details: {
        to: input.to,
        subject: input.subject,
        resendError: response.error.message,
      },
    });
  }

  return { id: response.data.id };
}
