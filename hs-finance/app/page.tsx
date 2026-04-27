// We need "use client" because we're using useSession which requires the browser
"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  // useSession checks if someone is logged in
  // session = user data if logged in, null if not logged in
  const { data: session } = useSession();

  // Team members data
  const teamMembers = [
    {
      name: "Sreeram",
      role: "CEO & Founder",
      bio: "Former school administrator with 10+ years of experience in educational finance.",
      image: "/team/SreeramSexy.jpg?v=2", // Replace with your actual image path
    },
    {
      name: "Owen",
      role: "CTO",
      bio: "Full-stack developer passionate about building tools that empower educators.",
      image: "/team/Owen.jpg", // Replace with your actual image path
    },
    {
      name: "Vardhan",
      role: "Head of Product",
      bio: "Former teacher who believes great software can transform school operations.",
      image: "/team/VardhanSexy.jpg?v=2", // Replace with your actual image path
    },
  ];

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
          Buttons — if logged in show Go to Transactions, 
          if not logged in show Sign In button
        */}
        <div className="mt-10">
          {session ? (
            // LOGGED IN — go straight to transactions
            <Link href="/transactions" className="bg-[#F87171] text-black font-semibold px-6 py-3 rounded-md hover:opacity-90">
              Go to Transactions
            </Link>
          ) : (
            // NOT LOGGED IN — show sign in button
            <button
              onClick={() => signIn()}
              className="bg-[#F87171] text-black font-semibold px-6 py-3 rounded-md hover:opacity-90"
            >
              Sign In to Get Started
            </button>
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

      {/* MEET OUR TEAM SECTION */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#F87171] border border-[#F87171] rounded-full px-3 py-1">
              Behind the Platform
            </span>
            <h2 className="text-4xl font-bold mt-4">
              Meet Our Team
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              We're educators, developers, and finance experts committed to making school financial management simple and transparent.
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className="bg-black border border-gray-800 rounded-xl overflow-hidden hover:border-[#F87171] transition-all duration-300 hover:scale-105"
              >
                {/* Image Container */}
                <div className="relative h-64 w-full bg-gray-800">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white">
                    {member.name}
                  </h3>
                  <p className="text-[#F87171] text-sm font-medium mt-1">
                    {member.role}
                  </p>
                  <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                    {member.bio}
                  </p>
                  
                  {/* Social Icons (optional) */}
                  <div className="flex gap-3 mt-4">
                    <button className="text-gray-500 hover:text-[#F87171] transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z"/>
                      </svg>
                    </button>
                    <button className="text-gray-500 hover:text-[#F87171] transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                      </svg>
                    </button>
                    <button className="text-gray-500 hover:text-[#F87171] transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
                        <circle cx="4" cy="4" r="2" stroke="none"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Optional: Footer or CTA Section */}
      <section className="py-16 px-6 text-center border-t border-gray-800">
        <p className="text-gray-500 text-sm">
          © 2024 School Finance Platform. Built with ❤️ for better education.
        </p>
      </section>

    </main>
  );
}