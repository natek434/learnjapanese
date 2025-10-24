"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Sun, MoonStar } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Toggle } from "@/src/components/ui/toggle";

const links = [
  { href: "/kana", label: "Kana" },
  { href: "/quiz", label: "Practice" },
  { href: "/progress", label: "Progress" },
  { href: "/about-learning", label: "How to Learn" },
  { href: "/research-notes", label: "Research" }
];

export function MainNav() {
  const pathname = usePathname();
  const { theme, setTheme, systemTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const activeTheme = theme === "system" ? systemTheme : theme;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold focus-outline">
          Kana Companion
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "focus-outline rounded-full px-3 py-1 transition",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {mounted ? (
            <Toggle
              pressed={activeTheme === "dark"}
              onPressedChange={(isDark) => setTheme(isDark ? "dark" : "light")}
              label="Toggle theme"
            >
              {activeTheme === "dark" ? <MoonStar className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Toggle>
          ) : (
            <div className="h-10 w-10" aria-hidden />
          )}
          {session?.user ? (
            <Link
              href="/auth/sign-out"
              className="focus-outline hidden rounded-full border border-border px-3 py-1 text-sm font-medium hover:bg-muted md:block"
            >
              Sign out
            </Link>
          ) : (
            <Link
              href="/auth/sign-in"
              className="focus-outline hidden rounded-full border border-border px-3 py-1 text-sm font-medium hover:bg-muted md:block"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
