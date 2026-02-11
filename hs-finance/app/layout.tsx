import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "./navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// load fonts
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
        <Navbar />

        {/* Page Content */}
        <main className="mx-auto max-w-6xl px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}