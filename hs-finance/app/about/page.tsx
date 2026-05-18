"use client";

export default function About() {
  const creators = [
    {
      name: "Owen Schade",
      role: "Database Manager",
      graduationClass: "Class of 2027",
      description: "Managed the database structure and app data.",
    },
    {
      name: "Sreeram Potnuru",
      role: "UX Manager",
      graduationClass: "Class of 2027",
      description: "Improved navigation and overall user experience.",
    },
    {
      name: "Gunavardhan Singu",
      role: "Style Manager",
      graduationClass: "Class of 2026",
      description: "Designed the app’s styling and visual appearance.",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-4">About</h1>

        {/* Intro Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10">
          <p className="text-gray-300 leading-relaxed">
            This app was created by the 
            <span className="text-white font-semibold" aria-label="Class">
            {" Software Engineering 2 "}
            </span>
            class at 
            <span className="text-[#F87171] font-semibold" aria-label="School">{" NCHS "}</span> in 2026.
          </p>
        </div>

        {/* Creators Section */}
        <div>
          <h2 className="text-lg font-semibold text-[#F87171] mb-4">
            Creators
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {creators.map((creator) => (
              <div
                key={creator.name}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4"
              >
                {/* Header */}
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {creator.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {creator.graduationClass}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-800" />

                {/* Role */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Role
                  </p>
                  <p className="text-white">{creator.role}</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-800" />

                {/* Contribution */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Contribution
                  </p>
                  <p className="text-gray-400 text-sm">
                    {creator.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}