import type { Metadata } from "next";
import { PropsWithChildren } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "./components/navbar";
import "./globals.css";
import { Providers } from "./lib/providers";


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
  title: "FinanceApp",
  description: "Accounting software for use by D203 H&S treasurers.",
  keywords: [
    "school finance",
    "financial reporting",
    "transactions",
    "account reconciliation",
    "audit reports",
  ],

  authors: [{ name: "Owen Schade" },{ name: "Sreeram Potnuru" },{ name: "Gunavardhan Singu" }],
  openGraph: {
    title: "FinanceApp",
    description:
      "Every dollar, every school, one place.",
    url: "https://finances.redhawks.us/",
    siteName: "FinanceApp",
    images: [
      {
        url: "https://finances.redhawks.us/card.png",
        width: 1200,
        height: 630,
        alt: "Finance Platform Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter / X Card
  twitter: {
    card: "summary_large_image",
    title: "FinanceApp",
    description:
      "Track transactions, reconcile accounts, and generate audit-ready reports across d203 schools.",
    images: ["https://finances.redhawks.us/card.png"],
  },
};

export default function RootLayout({
  children
}: Readonly<PropsWithChildren>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F9FAFB] text-[#1F2937]`}
        suppressHydrationWarning
      >
        <Providers>
          <Navbar/>
          {children}
        </Providers>
      </body>
    </html>
  );
}