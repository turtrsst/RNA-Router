import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RNA Router — AI Gateway Aggregator",
  description: "OpenRouter-compatible AI gateway with multi-provider free tier, auto-fallback, and key vault.",
};

import Sidebar from "./components/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-ink-950 text-slate-100">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
