"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/src/components/ui/button";

export function SignInForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "");

    setSubmitting(true);
    setError(null);

    const response = await signIn("credentials", {
      redirect: false,
      email,
      password,
      name: mode === "register" ? name : undefined,
      mode
    });

    setSubmitting(false);

    if (response?.error) {
      setError(response.error);
      return;
    }

    router.push("/quiz");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-4 rounded-xl border border-border bg-background/80 p-6 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">{mode === "login" ? "Welcome back" : "Create an account"}</h1>
        <p className="text-sm text-muted-foreground">
          {mode === "login"
            ? "Sign in to sync your progress across devices."
            : "Register with an email and password. No verification email required."}
        </p>
      </div>
      {mode === "register" ? (
        <label className="flex flex-col gap-1 text-sm">
          Display name
          <input
            name="name"
            type="text"
            required={mode === "register"}
            className="focus-outline rounded-md border border-border bg-transparent px-3 py-2"
            placeholder="Kana learner"
          />
        </label>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          className="focus-outline rounded-md border border-border bg-transparent px-3 py-2"
          placeholder="you@example.com"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="focus-outline rounded-md border border-border bg-transparent px-3 py-2"
          placeholder="At least 6 characters"
        />
      </label>
      {error ? <p className="text-sm text-red-500" role="alert">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting…" : mode === "login" ? "Sign in" : "Create account"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="text-sm"
      >
        {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
      </Button>
    </form>
  );
}
