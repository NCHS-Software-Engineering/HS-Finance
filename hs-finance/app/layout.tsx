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
  title: "Home and School Booking",
  description: "Accounting software for use by D203 H&S treasurers.",
};

export default function RootLayout({
  children
}: Readonly<PropsWithChildren>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F9FAFB] text-[#1F2937]`}
      >
        <Providers>
          <Navbar/>
          {children}
        </Providers>
      </body>
    </html>
  );
}