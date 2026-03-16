"use client";
import { useState, useEffect } from "react";
import { Entry, Fund } from "../types/index";

export default function Registers() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  let balance = 0;

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
        Date: new Date(entry.Date).toLocaleString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
        RegisterID: entry.RegisterID,
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

      fundFormatted.forEach((fund, index) => {
      if (fund.EntryID < entryFormatted.length) {
        entryFormatted[fund.EntryID].FundIDs.push(index);
      }
    });
      
      setFunds(fundFormatted);
      setEntries(entryFormatted);
    }
    fetchEntries();
  }, []);


  return (
    <div className="flex justify-center p-16">
      <div className="border rounded-lg shadow-sm overflow-hidden">

        <table className="w-full text-sm border-collapse">

          {/* Header */}
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="text-left p-3 border-b">Date</th>
              <th className="text-left p-3 border-b">Type</th>
              <th className="text-left p-3 border-b">
                <div>Payee</div>
                <div>Account</div>
              </th>
              <th className="text-left p-3 border-b">Memo</th>
              <th className="text-left p-3 border-b">
                <div>Class</div>
                <div>Location</div>
              </th>
              <th className="text-left p-3 border-b">Payment</th>
              <th className="text-left p-3 border-b">Deposit</th>
              <th className="text-left p-3 border-b">Info</th>
              <th className="text-left p-3 border-b">Balance</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {(!(entries.length===0))&&(entries.map((entry) => {
              let fundSum: number = 0;
              if (funds != null){
                for(let i = 0; i < entry.FundIDs.length; i++){
                  fundSum+=funds[entry.FundIDs[i]].Amount;
                }
              }
              balance+=fundSum
              return (
                <tr
                  key={entry.ID}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">
                    {entry.Date}
                  </td>

                  <td className="p-3">{entry.Location}</td>

                  <td className="p-3 text-gray-600">{entry.Memo}</td>

                  <td className="p-3">{}</td>

                  <td className="p-3">{entry.RegisterID}</td>

                  <td className="p-3">{String(entry.Void)}</td>

                  <td className="p-3">{String(entry.Rec)}</td>

                  <td className="p-3">{entry.EntryType}</td>

                  <td className="p-3">{
                    balance-fundSum
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