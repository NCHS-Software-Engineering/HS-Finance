import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home and School Books",
  description: "Accounting software for use by D203 H&S treasurers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F9FAFB] text-[#1F2937]`}
      >
        {/* Navbar */}
        <nav className="w-full border-b border-[#F87171] bg-black">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
            {/* App Name */}
            <div className="text-lg font-semibold tracking-tight">
              FinanceApp
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-8 text-sm">
              <a
                href="/"
                className="text-[#F87171] hover:text-[#ffffff] hover:underline underline-offset-4"
              >
                Home
              </a>
              <a
                href="/transactions"
                className="text-[#F87171] hover:text-[#ffffff] hover:underline underline-offset-4"
              >
                Transactions
              </a>
              <a
                href="/settings"
                className="text-[#F87171] hover:text-[#ffffff] hover:underline underline-offset-4"
              >
                Settings
              </a>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="mx-auto max-w-6xl px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}