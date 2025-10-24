import type { Metadata } from "next";
import { SignInForm } from "@/src/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Access Kana Companion and save your spaced-repetition progress."
};

export default function SignInPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-bold">Sign in to Kana Companion</h1>
        <p className="mt-2 text-muted-foreground">
          Create a quick account to sync your decks and streaks across devices. We store only the
          essentials.
        </p>
      </div>
      <SignInForm />
    </section>
  );
}
