import type { Metadata } from "next";
import "./globals.css";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  title: "Snack State",
  description: "Tell us how you want to feel. Get a fast snack idea in under 5 minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-stone-50 text-stone-900">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-stone-200 bg-stone-50">
            <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
              <a href="/" className="text-sm font-semibold tracking-widest uppercase text-stone-900 hover:text-stone-600 transition-colors">
                Snack State
              </a>
              <a
                href="/saved"
                className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
              >
                Saved
              </a>
            </div>
          </header>
          <Analytics />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">
            Generic snack recommendations only. Not medical advice.
          </footer>
        </div>
      </body>
    </html>
  );
}
