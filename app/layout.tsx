import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Providers } from "@/src/components/providers";
import { cn } from "@/src/lib/utils";
import { MainNav } from "@/src/components/navigation/main-nav";
import { Footer } from "@/src/components/navigation/footer";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Kana Companion",
  description:
    "Learn Japanese kana with spaced repetition flashcards, pronunciation practice, and stroke guidance.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://example.com")
};

export const viewport: Viewport = {
  themeColor: "#2563eb"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background text-foreground antialiased", notoSans.variable)}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <MainNav />
            <main className="flex-1 px-4 pb-12 pt-8 sm:px-6 lg:px-8">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
