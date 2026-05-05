"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface RegisterBalance {
  ID: number;
  RegisterName: string;
  Balance: number;
}

export default function Stats() {
  const { data: session } = useSession();
  const [registers, setRegisters] = useState<RegisterBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();
        // Ensure Balance is a number
        const typedData = data.map((reg: any) => ({
          ...reg,
          Balance: Number(reg.Balance),
        }));
        setRegisters(typedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <div className="text-center py-12">Loading...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <div className="text-center py-12 text-red-400">Error: {error}</div>
        </div>
      </main>
    );
  }

  const totalBalance = registers.reduce((sum, reg) => sum + reg.Balance, 0);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Register Stats</h1>
          <p className="text-gray-400">Overview of all registers and their balances</p>
        </div>

        {/* Total Balance Card */}
        <div className="mb-8 p-6 rounded-lg border border-[#F87171] bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a]">
          <div className="text-gray-400 text-sm font-semibold mb-2">TOTAL BALANCE</div>
          <div className="text-4xl font-bold text-[#F87171]">
            ${totalBalance.toFixed(2)}
          </div>
        </div>

        {/* Registers Table */}
        <div className="overflow-x-auto rounded-lg border border-[#F87171]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F87171] bg-[#1a1a1a]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Register Name
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {registers.map((register) => (
                <tr
                  key={register.ID}
                  className="border-b border-gray-800 hover:bg-[#1a1a1a] transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-100">
                    {register.RegisterName}
                  </td>
                  <td
                    className={`px-6 py-4 text-right text-sm font-semibold ${
                      register.Balance >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    ${register.Balance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {registers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No registers found</p>
          </div>
        )}
      </div>
    </main>
  );
}
