"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import {
  Button,
  CheckIcon,
  cn,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  LoaderIcon,
  toast,
} from "@microlearn/ui";

import { useTRPC } from "~/trpc/react";

const MIN_PASSWORD_LENGTH = 8;

interface SetPasswordSectionProps {
  initialHasPassword: boolean;
}

export function SetPasswordSection({
  initialHasPassword,
}: SetPasswordSectionProps) {
  const [hasPassword, setHasPassword] = useState(initialHasPassword);

  if (hasPassword) {
    return (
      <EmptySettings message="No additional settings yet — more options coming soon." />
    );
  }

  return (
    <section>
      <header className="mb-6">
        <h2 className="text-base font-semibold">Set a password</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Your account uses Google sign-in. Add a password so you can also sign
          in with email and password.
        </p>
      </header>

      <SetPasswordForm onSuccess={() => setHasPassword(true)} />
    </section>
  );
}

function EmptySettings({ message }: { message: string }) {
  return (
    <div className="border-border text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
      {message}
    </div>
  );
}

interface SetPasswordFormProps {
  onSuccess: () => void;
}

function SetPasswordForm({ onSuccess }: SetPasswordFormProps) {
  const trpc = useTRPC();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const setPassword = useMutation(
    trpc.auth.setPassword.mutationOptions({
      onSuccess: () => {
        toast.success(
          "Password set. You can now sign in with email and password.",
        );
        setNewPassword("");
        setConfirmPassword("");
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't set password. Try again.");
      },
    }),
  );

  const meetsLength = newPassword.length >= MIN_PASSWORD_LENGTH;
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSave = meetsLength && passwordsMatch && !setPassword.isPending;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    setPassword.mutate({ newPassword });
  };

  const showMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="newPassword">New password</FieldLabel>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            disabled={setPassword.isPending}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <PasswordChecklist meetsLength={meetsLength} />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            disabled={setPassword.isPending}
            aria-invalid={showMismatch}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {showMismatch && (
            <FieldError errors={[{ message: "Passwords don't match." }]} />
          )}
        </Field>

        <Button
          type="submit"
          disabled={!canSave}
          className={cn("h-10 w-fit gap-1.5", "disabled:opacity-50")}
        >
          {setPassword.isPending && <LoaderIcon className="animate-spin" />}
          Save
        </Button>
      </FieldGroup>
    </form>
  );
}

interface PasswordChecklistProps {
  meetsLength: boolean;
}

function PasswordChecklist({ meetsLength }: PasswordChecklistProps) {
  return (
    <FieldDescription>
      <ChecklistItem met={meetsLength} label="At least 8 characters" />
    </FieldDescription>
  );
}

function ChecklistItem({ met, label }: { met: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs transition-colors",
        met ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "inline-flex size-3.5 items-center justify-center rounded-full border transition-colors",
          met
            ? "border-foreground bg-foreground text-background"
            : "border-muted-foreground/40 bg-transparent",
        )}
        aria-hidden
      >
        {met && <CheckIcon size={10} />}
      </span>
      {label}
    </span>
  );
}
