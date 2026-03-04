import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snack State",
  description: "Tell us how you want to feel. Get a fast snack idea in under 5 minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-gray-100 bg-white">
            <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
              <a href="/" className="text-lg font-bold tracking-tight text-gray-900 hover:text-gray-700">
                Snack State
              </a>
              <a
                href="/saved"
                className="text-sm text-gray-500 hover:text-gray-800 font-medium"
              >
                Saved
              </a>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
            Snack State MVP — generic snack recommendations only. Not medical advice.
          </footer>
        </div>
      </body>
    </html>
  );
}
