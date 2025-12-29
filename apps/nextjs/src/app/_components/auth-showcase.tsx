import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Button, SparklesIcon } from "@microlearn/ui";

import { auth, getSession } from "~/auth/server";
import { CenteredContainer } from "./centered-container";
import { FeatureCard } from "./feature-card";
import { Hero } from "./hero";

const FEATURES = [
  {
    icon: "💬",
    title: "Smart Conversations",
    description: "Chat naturally with AI that understands context",
  },
  {
    icon: "📚",
    title: "Bite-Sized Learning",
    description: "Break down complex topics into manageable chunks",
  },
  {
    icon: "🎯",
    title: "Personalized",
    description: "Tailored to your pace and learning style",
  },
] as const;

export async function AuthShowcase() {
  const session = await getSession();

  if (!session) {
    return (
      <CenteredContainer>
        <div className="flex max-w-2xl flex-col items-center gap-8 text-center">
          <Hero
            icon={<SparklesIcon className="size-8 text-primary" />}
            title="MicroLearn"
            description="Your personal AI tutor for microlearning. Learn anything, one conversation at a time."
          />

          <form>
            <Button
              size="lg"
              className="cursor-pointer px-8 py-6 text-base"
              formAction={async () => {
                "use server";
                const res = await auth.api.signInSocial({
                  body: {
                    provider: "google",
                    callbackURL: "/",
                  },
                });
                if (!res.url) {
                  throw new Error("No URL returned from signInSocial");
                }
                redirect(res.url);
              }}
            >
              Sign in with Google
            </Button>
          </form>

          <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer className="gap-4">
      <p className="text-center text-2xl">
        <span>Logged in as {session.user.name}</span>
      </p>

      <form>
        <Button
          size="lg"
          formAction={async () => {
            "use server";
            await auth.api.signOut({
              headers: await headers(),
            });
            redirect("/");
          }}
        >
          Sign out
        </Button>
      </form>
    </CenteredContainer>
  );
}
