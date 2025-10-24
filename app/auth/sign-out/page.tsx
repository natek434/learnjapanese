"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/src/components/ui/button";

export default function SignOutPage() {
  const [isSigningOut, setSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <section className="mx-auto flex max-w-lg flex-col items-center gap-6">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Sign out</h1>
        <p className="text-muted-foreground">We’ll clear your session on this device.</p>
      </header>
      <Button onClick={handleSignOut} disabled={isSigningOut} className="w-full max-w-sm">
        {isSigningOut ? "Signing out…" : "Sign out now"}
      </Button>
    </section>
  );
}
