// We need "use client" to use useSession in the browser
"use client";

import { useSession } from "next-auth/react";

export default function SettingsPage() {
  // Get the logged in user's info from Google
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="mx-auto max-w-2xl">
        
        {/* Page title */}
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* ACCOUNT SECTION */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[#F87171] mb-4">Account</h2>
          
          {/* Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
            
            {/* Name */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Name</p>
              <p className="text-white">{session?.user?.name ?? "—"}</p>
              {/* ?? "—" means: if name is null or undefined, just show a dash */}
            </div>

            {/* Divider line */}
            <div className="h-px bg-gray-800" />

            {/* Email */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Email</p>
              <p className="text-white">{session?.user?.email ?? "—"}</p>
            </div>

            {/* Divider line */}
            <div className="h-px bg-gray-800" />

            {/* Google note */}
            <p className="text-xs text-gray-600">
              Your account is managed through Google. To update your name or email, visit your Google account settings.
            </p>

          </div>
        </div>

        {/* PREFERENCES SECTION */}
        <div>
          <h2 className="text-lg font-semibold text-[#F87171] mb-4">Preferences</h2>

          {/* Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">

            {/* Role */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Role</p>
              <p className="text-white">Treasurer</p>
              {/* Hardcoded for now — will pull from database later */}
            </div>

            {/* Divider line */}
            <div className="h-px bg-gray-800" />

            {/* School */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">School</p>
              <p className="text-gray-500 italic">Coming soon</p>
              {/* Will connect to database later */}
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}