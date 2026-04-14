// We need "use client" because we're using useSession which requires the browser
"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  // useSession checks if someone is logged in
  // session = user data if logged in, null if not logged in
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">

        {/* Small label above the headline */}
        <span className="mb-4 text-xs font-semibold tracking-widest uppercase text-[#F87171] border border-[#F87171] rounded-full px-3 py-1">
          Home & School Finance Platform
        </span>

        {/* Main headline */}
        <h1 className="text-5xl font-bold mt-2">
          Every dollar, <span className="text-[#F87171]">every school,</span> one place.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-gray-400 max-w-xl text-lg">
          Track transactions, reconcile accounts, and generate audit-ready reports across all 24 schools.
        </p>

        {/* 
          Buttons — this is the key part.
          If session exists (logged in): show navigation buttons
          If no session (not logged in): show a Sign In button instead
        */}
        <div className="mt-10 flex gap-4">
          {session ? (
            // LOGGED IN — show these two buttons
            <>
              <Link href="/transactions" className="bg-[#F87171] text-black font-semibold px-6 py-3 rounded-md hover:opacity-90">
                Go to Transactions
              </Link>
              <Link href="/registers" className="border border-[#F87171] text-[#F87171] font-semibold px-6 py-3 rounded-md hover:bg-[#F87171] hover:text-black">
                View Registers
              </Link>
            </>
          ) : (
            // NOT LOGGED IN — show sign in button and a message
            <>
              <button
                onClick={() => signIn()}
                className="bg-[#F87171] text-black font-semibold px-6 py-3 rounded-md hover:opacity-90"
              >
                Sign In to Get Started
              </button>
            </>
          )}
        </div>

        {/* 
          Show a small welcome message if logged in.
          session.user?.name is the logged in user's name — the ? means
          "only try to get .name if .user exists, otherwise don't crash"
        */}
        {session && (
          <p className="mt-6 text-sm text-gray-500">
            Welcome back, {session.user?.name}!
          </p>
        )}

      </section>

    </main>
  );
}