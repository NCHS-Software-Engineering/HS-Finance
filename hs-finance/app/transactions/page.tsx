export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* ===== PAGE HEADER ===== */}
      <div className="border-b border-[#D1D5DB] bg-white px-8 py-6">
        
        {/* Account Title */}
        <h1 className="text-2xl font-bold text-[#1F2937]">
          Bank Register
        </h1>

        {/* Account Info Row */}
        <div className="mt-4 flex items-center justify-between">

          {/* Left side: Account selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-[#4B5563]">
              Account:
            </label>

            {/* 
              This dropdown will eventually pull accounts from backend.
              BACKEND REQUIRED: fetch list of accounts.
            */}
            <select className="rounded-md border border-[#1F2937] bg-white px-3 py-1 text-sm">
              <option>BMO Checking</option>
              <option>Savings Account</option>
            </select>
          </div>

          {/* Right side: Current Balance */}
          <div className="text-right">
            <p className="text-sm text-[#6B7280]">Current Balance</p>

            {/* 
              BACKEND REQUIRED:
              This value should come from database calculation.
            */}
            <p className="text-xl font-semibold text-[#1F2937]">
              $16,763.45
            </p>
          </div>

        </div>
      </div>


      {/* ===== TRANSACTIONS TABLE ===== */}
      <div className="px-8 py-8">

        <div className="overflow-x-auto rounded-lg border border-[#D1D5DB] bg-white shadow-sm">

          <table className="w-full table-auto border-collapse">

            {/* ===== TABLE HEADER ===== */}
            <thead className="bg-[#F3F4F6] text-left text-sm font-semibold text-[#4B5563]">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Deposit</th>
                <th className="px-4 py-3">Balance</th>
              </tr>
            </thead>

            {/* ===== TABLE BODY ===== */}
            <tbody className="text-sm text-[#1F2937]">

              {/* 
                This is a single transaction row.
                BACKEND REQUIRED:
                Later this will be mapped from database transactions.
              */}
              <tr className="border-t border-[#E5E7EB] hover:bg-[#F3F4F6]">
                <td className="px-4 py-3">12/31/2025</td>
                <td className="px-4 py-3">Maplebrook H&S</td>
                <td className="px-4 py-3 text-[#B91C1C]">$100.00</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3">$16,763.45</td>
              </tr>

              <tr className="border-t border-[#E5E7EB] hover:bg-[#F3F4F6]">
                <td className="px-4 py-3">12/01/2025</td>
                <td className="px-4 py-3">NNHS Home & School</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-[#16A34A]">$1,000.00</td>
                <td className="px-4 py-3">$17,763.45</td>
              </tr>

            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}