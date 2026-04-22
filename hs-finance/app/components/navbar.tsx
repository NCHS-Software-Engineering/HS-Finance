"use client";
import { useState } from "react";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
// Image is Next.js's optimized image component — better than a regular <img> tag

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="w-full border-b border-[#F87171] bg-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
        
        {/* App Name */}
        <div className="text-lg font-semibold tracking-tight text-white">
          FinanceApp
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-8 text-sm relative">
          <div className="flex items-center gap-8 text-sm">
            
            {/* Navigation Links */}
            <Link href="/" className="cursor-pointer text-[#F87171] hover:text-[#ffffff] hover:underline underline-offset-4">
              Home
            </Link>
            <Link href="/transactions" className="cursor-pointer text-[#F87171] hover:text-[#ffffff] hover:underline underline-offset-4">
              Transactions
            </Link>
            <Link href="/settings" className="cursor-pointer text-[#F87171] hover:text-[#ffffff] hover:underline underline-offset-4">
              Settings
            </Link>

            {/* Sign In when signed out, Profile button when signed in */}
            {session ? (
              <div className="relative">

                {/* Profile button — shows Google profile picture instead of text */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="cursor-pointer rounded-full border-2 border-[#F87171] overflow-hidden w-8 h-8 hover:opacity-80"
                >
                  {session.user?.image ? (
                    // If Google gave us a profile picture, show it
                    // session.user.image is the URL of their Google profile photo
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // If there's no picture for some reason, show their initial
                    <div className="w-full h-full bg-[#F87171] flex items-center justify-center text-black font-bold text-xs">
                      {session.user?.name?.charAt(0) ?? "?"}
                      {/* .charAt(0) gets the first letter of their name */}
                    </div>
                  )}
                </button>

                {/* Dropdown menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md border border-[#F87171] bg-white shadow-sm">
                    
                    {/* Profile info at the top of the dropdown */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
                      {/* Profile picture inside the dropdown too */}
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt="Profile"
                          width={32}
                          height={32}
                          className="rounded-full w-8 h-8 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#F87171] flex items-center justify-center text-black font-bold text-xs">
                          {session.user?.name?.charAt(0) ?? "?"}
                        </div>
                      )}
                      {/* Name and email */}
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-gray-800">
                          {session.user?.name ?? "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[100px]">
                          {session.user?.email ?? ""}
                          {/* truncate cuts off the email if it's too long */}
                        </p>
                      </div>
                    </div>

                    {/* Account button */}
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="cursor-pointer block w-full px-4 py-2 text-left text-sm text-[#4B5563] hover:bg-[#F3F4F6]"
                    >
                      Account
                    </Link>

                    {/* Sign Out button */}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      className="cursor-pointer block w-full px-4 py-2 text-left text-sm text-[#B91C1C] hover:bg-[#F3F4F6]"
                    >
                      Sign Out
                    </button>

                  </div>
                )}
              </div>
            ) : (
              // NOT LOGGED IN — show Sign In button
              <button
                onClick={() => signIn()}
                className="cursor-pointer rounded-md border border-[#F87171] px-3 py-1 text-[#D1D5DB] hover:bg-[#F87171]"
              >
                Sign In
              </button>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}