import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/90 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>&copy; {new Date().getFullYear()} Kana Companion. Built for focused Japanese study.</p>
        <div className="flex items-center gap-4">
          <Link href="/research-notes" className="focus-outline">
            Research notes
          </Link>
          <Link href="https://github.com/natek434/learnjapanese" className="focus-outline">
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
