"use client";
import { useState } from "react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

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
            {/* Profile Button */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-md border border-[#F87171] px-3 py-1 text-[#D1D5DB] hover:bg-[#F87171]"
              >
                Profile
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-md border border-[#F87171] bg-white shadow-sm">
                  {!isSignedIn ? (
                    <button
                      onClick={() => {
                        setIsSignedIn(true);
                        setMenuOpen(false);

                        /*
                        BACKEND REQUIRED:
                        This is where you would call your authentication system
                        (e.g., JWT login, OAuth, Firebase, NextAuth, etc.)
                        to properly sign in the user.
                        */
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-[#4B5563] hover:bg-[#F3F4F6]"
                    >
                      Sign In
                    </button>
                  ) : (
                    <>
                      <button
                        className="block w-full px-4 py-2 text-left text-sm text-[#4B5563] hover:bg-[#F3F4F6]"
                      >
                        Account
                      </button>

                      <button
                        onClick={() => {
                          setIsSignedIn(false);
                          setMenuOpen(false);

                          /*
                          BACKEND REQUIRED:
                          This is where you would clear session cookies,
                          invalidate tokens, or call your logout API.
                          */
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-[#B91C1C] hover:bg-[#F3F4F6]"
                      >
                        Sign Out
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
