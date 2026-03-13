"use client";
import { useState, useEffect } from "react";
import { Entry, Fund } from "../types/index";

export default function Registers() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);

  useEffect(() => {
    async function fetchEntries() {
      const res = await fetch("/api/entries");
      if (!res.ok) return;
      const entryData = await res.json();
      const entryFormatted: Entry[] = entryData.map((entry: any) => ({
        ID: entry.ID,
        TransactionID: entry.TransactionID,
        Location: entry.Location,
        Memo: entry.Memo,
        Date: entry.Date,
        RegisterID: entry,
        Void: entry.Void,
        Rec: entry.Rec,
        EntryType: entry.EntryType,
        FundIDs: []
      }));
      

      const fundRes = await fetch("/api/funds");
      if (!fundRes.ok) return;
      const fundData = await fundRes.json();
      const fundFormatted: Fund[] = fundData.map((fund: any) => ({
        ID: fund.ID,
        EntryID: fund.EntryID,
        AccountID: fund.AccountID,
        Target: fund.Target,
        Description: fund.Description,
        PaymentMethod: fund.PaymentMethod,
        ReferenceNumber: fund.ReferenceNumber,
        Amount: fund.Amount,
        Class: fund.Class
      }));

      fundFormatted.map((fund) => {(fund.EntryID < entries.length) && (entries[fund.EntryID].FundIDs.push(fund.ID))});
      
      setFunds(fundFormatted);
      setEntries(entryFormatted);
    }
    fetchEntries();
  }, []);


  return (
    <div className="flex justify-center p-6">
      <div className="border rounded-lg shadow-sm overflow-hidden">

        <table className="w-full text-sm border-collapse">

          {/* Header */}
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="text-left p-3 border-b">Transaction</th>
              <th className="text-left p-3 border-b">Location</th>
              <th className="text-left p-3 border-b">Memo</th>
              <th className="text-left p-3 border-b">Date</th>
              <th className="text-left p-3 border-b">Register</th>
              <th className="text-left p-3 border-b">Void</th>
              <th className="text-left p-3 border-b">Rec</th>
              <th className="text-left p-3 border-b">Type</th>
              <th className="text-left p-3 border-b">Funds</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {(!(entries.length===0))&&(entries.map((entry) => {
              return (
                <tr
                  key={entry.ID}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">
                    {entry.TransactionID}
                  </td>

                  <td className="p-3">{entry.Location}</td>

                  <td className="p-3 text-gray-600">{entry.Memo}</td>

                  <td className="p-3">{entry.Date instanceof Date ? entry.Date.toLocaleDateString() : entry.Date}</td>

                  <td className="p-3">{entry.RegisterID}</td>

                  <td className="p-3">{String(entry.Void)}</td>

                  <td className="p-3">{String(entry.Rec)}</td>

                  <td className="p-3">{entry.EntryType}</td>

                  <td className="p-3">{
                    ((entry.FundIDs.length>0)&&entry.FundIDs.map((FundID) => (
                      <span key={FundID}>yo</span>
                    )))
                  }</td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>
    </div>
  );
}