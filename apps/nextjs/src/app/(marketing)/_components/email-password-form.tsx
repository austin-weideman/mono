"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import {
  Button,
  cn,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  LoaderIcon,
} from "@mono/ui";

import { authClient } from "~/auth/client";
import { CheckEmailPrompt } from "./check-email-prompt";

const inputClass = cn(
  "bg-bone-white border-lichen text-abyssal-ink placeholder:text-graphite/50 h-11 text-[15px]",
  "focus-visible:border-abyssal-ink focus-visible:ring-abyssal-ink/15",
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
);

const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const signUpSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(60, "Keep your name under 60 characters."),
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Keep your password under 72 characters."),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

interface EmailPasswordFormProps {
  mode: "signin" | "signup";
}

export function EmailPasswordForm({ mode }: EmailPasswordFormProps) {
  return mode === "signin" ? <SignInForm /> : <SignUpForm />;
}

function SignInForm() {
  const router = useRouter();
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: "/chat",
    });

    if (error) {
      form.setError("root", {
        message: error.message ?? "Something went wrong. Try again.",
      });
      return;
    }

    router.push("/chat");
    router.refresh();
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            disabled={isSubmitting}
            aria-invalid={!!errors.email}
            className={inputClass}
            {...form.register("email")}
          />
          <FieldError errors={errors.email ? [errors.email] : []} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={isSubmitting}
            aria-invalid={!!errors.password}
            className={inputClass}
            {...form.register("password")}
          />
          <FieldError errors={errors.password ? [errors.password] : []} />
        </Field>

        {errors.root && <FieldError errors={[errors.root]} />}

        <SubmitButton isSubmitting={isSubmitting}>Sign in</SubmitButton>
      </FieldGroup>
    </form>
  );
}

function SignUpForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: "/verify-email",
    });

    if (error) {
      form.setError("root", {
        message: error.message ?? "Something went wrong. Try again.",
      });
      return;
    }

    setSubmittedEmail(values.email);
  });

  if (submittedEmail) {
    return <CheckEmailPrompt email={submittedEmail} />;
  }

  const {
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            autoFocus
            disabled={isSubmitting}
            aria-invalid={!!errors.name}
            className={inputClass}
            {...form.register("name")}
          />
          <FieldError errors={errors.name ? [errors.name] : []} />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            aria-invalid={!!errors.email}
            className={inputClass}
            {...form.register("email")}
          />
          <FieldError errors={errors.email ? [errors.email] : []} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-invalid={!!errors.password}
            className={inputClass}
            {...form.register("password")}
          />
          <FieldDescription>At least 8 characters.</FieldDescription>
          <FieldError errors={errors.password ? [errors.password] : []} />
        </Field>

        {errors.root && <FieldError errors={[errors.root]} />}

        <SubmitButton isSubmitting={isSubmitting}>Create account</SubmitButton>
      </FieldGroup>
    </form>
  );
}

interface SubmitButtonProps {
  isSubmitting: boolean;
  children: React.ReactNode;
}

function SubmitButton({ isSubmitting, children }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={cn(
        "bg-abyssal-ink text-paper hover:bg-abyssal-ink/90 font-roboto-mono h-11 w-full rounded-lg text-[13px] tracking-[-0.02em] uppercase",
        "transition-transform duration-150 ease-out",
        "hover:scale-[1.01] active:scale-[0.99]",
        "disabled:hover:scale-100",
      )}
    >
      {isSubmitting && <LoaderIcon className="animate-spin" />}
      {children}
    </Button>
  );
}
