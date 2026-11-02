import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RNA Router — AI Gateway Aggregator",
  description: "OpenRouter-compatible AI gateway with multi-provider free tier, auto-fallback, and key vault.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-ink-950 text-slate-100">
        <main>{children}</main>
      </body>
    </html>
  );
}
