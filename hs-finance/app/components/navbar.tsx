"use client";
import { useState } from "react";

// Using the <Link> component instead of HTML <a> links is preferable in Next.js for internal links
// External links or file downloads should still use <a>
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const {data: session} = useSession();

  return (
    <nav className="w-full border-b border-[#F87171] bg-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
        {/* App Name */}
        <div className="text-lg font-semibold tracking-tight">
          FinanceApp
        </div>
        {/* Right Side */}
        <div className="flex items-center gap-8 text-sm relative">
          {/* Navigation Links */}
          <div className="flex items-center gap-8 text-sm">
            <Link
              href="/"
              className="text-[#F87171] hover:text-[#ffffff] hover:underline underline-offset-4"
            >
              Home
            </Link>
            <Link
              href="/transactions"
              className="text-[#F87171] hover:text-[#ffffff] hover:underline underline-offset-4"
            >
              Transactions
            </Link>
            <Link
              href="/settings"
              className="text-[#F87171] hover:text-[#ffffff] hover:underline underline-offset-4"
            >
              Settings
            </Link>
            {// Sign In when signed out, Profile dropdown when signed in
              session ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="rounded-md border border-[#F87171] px-3 py-1 text-[#D1D5DB] hover:bg-[#F87171]"
                  >
                    Profile
                  </button>
                  {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-md border border-[#F87171] bg-white shadow-sm">
                      <>
                        <button
                          className="block w-full px-4 py-2 text-left text-sm text-[#4B5563] hover:bg-[#F3F4F6]"
                        >
                          Account
                        </button>

                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            signOut();
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-[#B91C1C] hover:bg-[#F3F4F6]"
                        >
                          Sign Out
                        </button>
                      </>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => signIn()}
                    className="rounded-md border border-[#F87171] px-3 py-1 text-[#D1D5DB] hover:bg-[#F87171]"
                  >
                    Sign In
                  </button>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </nav>
  );
}
