export default function TransactionsPage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] px-8 py-10">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-[#1F2937] mb-8">
        Transactions
      </h1>

      {/* Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-[#D1D5DB] p-6">

        {/* Section Header */}
        <h2 className="text-lg font-semibold text-[#1F2937] mb-4">
          Recent Activity
        </h2>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">

            {/* Table Head */}
            <thead>
              <tr className="bg-[#F3F4F6] text-left text-sm text-[#4B5563]">
                <th className="px-4 py-3 border-b border-[#D1D5DB]">Date</th>
                <th className="px-4 py-3 border-b border-[#D1D5DB]">Description</th>
                <th className="px-4 py-3 border-b border-[#D1D5DB]">Category</th>
                <th className="px-4 py-3 border-b border-[#D1D5DB] text-right">Amount</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="text-sm text-[#1F2937]">
              <tr className="hover:bg-[#F3F4F6]">
                <td className="px-4 py-3 border-b border-[#E5E7EB]">02/10/2026</td>
                <td className="px-4 py-3 border-b border-[#E5E7EB]">Office Supplies</td>
                <td className="px-4 py-3 border-b border-[#E5E7EB] text-[#6B7280]">Business</td>
                <td className="px-4 py-3 border-b border-[#E5E7EB] text-right">-$120.00</td>
              </tr>

              <tr className="bg-[#F9FAFB] hover:bg-[#F3F4F6]">
                <td className="px-4 py-3 border-b border-[#E5E7EB]">02/08/2026</td>
                <td className="px-4 py-3 border-b border-[#E5E7EB]">Client Payment</td>
                <td className="px-4 py-3 border-b border-[#E5E7EB] text-[#6B7280]">Income</td>
                <td className="px-4 py-3 border-b border-[#E5E7EB] text-right text-[#16A34A]">
                  +$2,500.00
                </td>
              </tr>

              <tr className="hover:bg-[#F3F4F6]">
                <td className="px-4 py-3">02/05/2026</td>
                <td className="px-4 py-3">Software Subscription</td>
                <td className="px-4 py-3 text-[#6B7280]">Tools</td>
                <td className="px-4 py-3 text-right">-$49.99</td>
              </tr>
            </tbody>

          </table>
        </div>
      </div>
    </main>
  );
}