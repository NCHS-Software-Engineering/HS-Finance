"use client";
import { useState, useEffect } from "react";

type Entry = {
  ID: number;
  TransactionID: number;
  Location: string;
  Memo: string;
  Date: Date;
  RegisterID: number;
  Void: boolean;
  Rec: boolean;
  EntryType: string;
};

type Fund = {
  ID: number;
  EntryID: number;
  AccountID: number;
  Target: string;
  Description: string;
  PaymentMethod: string;
  ReferenceNumber: number;
  Amount: number;
  Class: string;
};

export default function Entries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const entriesRes = await fetch("/api/entries");
        const entriesData = await entriesRes.json();
        setEntries(entriesData);

        const fundsRes = await fetch("/api/funds");
        const fundsData = await fundsRes.json();
        setFunds(fundsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const getFundsForEntry = (entryID: number) => {
    return funds.filter((fund) => fund.EntryID === entryID);
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-100 p-12">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-6">

        <h1 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          Register Entries
        </h1>

        <table className="w-full border-collapse text-sm">

          {/* HEADER */}
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="p-3 text-left">Transaction</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Memo</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Register</th>
              <th className="p-3 text-left">Void</th>
              <th className="p-3 text-left">Rec</th>
              <th className="p-3 text-left">Type</th>
            </tr>
          </thead>

          <tbody>
            {entries.length > 0 ? (
              entries.map((entry) => {
                const entryFunds = getFundsForEntry(entry.ID);

                return (
                  <>
                    {/* ENTRY ROW */}
                    <tr
                      key={`entry-${entry.ID}`}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3">{entry.TransactionID}</td>
                      <td className="p-3">{entry.Location}</td>
                      <td className="p-3 text-gray-600">{entry.Memo}</td>
                      <td className="p-3">
                        {new Date(entry.Date).toLocaleDateString()}
                      </td>
                      <td className="p-3">{entry.RegisterID}</td>
                      <td className="p-3">{entry.Void ? "Yes" : "No"}</td>
                      <td className="p-3">{entry.Rec ? "Yes" : "No"}</td>
                      <td className="p-3">{entry.EntryType}</td>
                    </tr>

                    {/* FUNDS ROW */}
                    {entryFunds.length > 0 && (
                      <tr key={`funds-${entry.ID}`}>
                        <td colSpan={8} className="p-4 bg-gray-50">

                          <div className="rounded-lg border bg-white shadow-sm overflow-hidden">

                            <table className="w-full text-sm">

                              <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                  <th className="p-2 text-left">Account</th>
                                  <th className="p-2 text-left">Target</th>
                                  <th className="p-2 text-left">Description</th>
                                  <th className="p-2 text-left">Payment</th>
                                  <th className="p-2 text-left">Reference</th>
                                  <th className="p-2 text-left">Amount</th>
                                  <th className="p-2 text-left">Class</th>
                                </tr>
                              </thead>

                              <tbody>
                                {entryFunds.map((fund) => (
                                  <tr
                                    key={`fund-${fund.ID}`}
                                    className="border-t hover:bg-gray-50"
                                  >
                                    <td className="p-2">{fund.AccountID}</td>
                                    <td className="p-2">{fund.Target}</td>
                                    <td className="p-2">{fund.Description}</td>
                                    <td className="p-2">{fund.PaymentMethod}</td>
                                    <td className="p-2">{fund.ReferenceNumber}</td>
                                    <td className="p-2 font-medium">
                                      ${fund.Amount.toFixed(2)}
                                    </td>
                                    <td className="p-2">{fund.Class}</td>
                                  </tr>
                                ))}
                              </tbody>

                            </table>
                          </div>

                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center p-8 text-gray-500">
                  No entries found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}