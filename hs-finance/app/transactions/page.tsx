"use client";

import { useState } from "react";

/*
  This type defines what ONE transaction looks like.
  Think of it like a Java class.
*/
type Transaction = {
  id: number;
  date: string;
  payee: string;
  memo: string;
  payment: number;
  deposit: number;
  balance: number;
};

export default function TransactionsPage() {
  /*
    This is temporary FRONTEND-ONLY data.

    BACKEND REQUIRED:
    Later, this should come from your database
    using an API call like:
    fetch("/api/transactions")
  */
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      date: "12/01/2025",
      payee: "NNHS Home & School",
      memo: "Zelle transfer",
      payment: 1000,
      deposit: 0,
      balance: 16763.45,
    },
    {
      id: 2,
      date: "11/28/2025",
      payee: "CCD Amer Online",
      memo: "Donation",
      payment: 0,
      deposit: 316.48,
      balance: 18013.45,
    },
  ]);

  /*
    These states are for the "Add Transaction" form
  */
  const [date, setDate] = useState("");
  const [payee, setPayee] = useState("");
  const [memo, setMemo] = useState("");
  const [payment, setPayment] = useState(0);
  const [deposit, setDeposit] = useState(0);

  /*
    This function runs when user clicks "Add Transaction"
  */
  const handleAddTransaction = () => {
    /*
      BACKEND REQUIRED:
      Instead of calculating balance on frontend,
      this should be calculated by backend
      and stored in database.
    */
    const lastBalance =
      transactions.length > 0
        ? transactions[transactions.length - 1].balance
        : 0;

    const newBalance = lastBalance - payment + deposit;

    const newTransaction: Transaction = {
      id: transactions.length + 1,
      date,
      payee,
      memo,
      payment,
      deposit,
      balance: newBalance,
    };

    /*
      FRONTEND STATE UPDATE
      (temporary until backend exists)
    */
    setTransactions([...transactions, newTransaction]);

    /*
      BACKEND REQUIRED:
      Here is where you would POST to your API:

      await fetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify(newTransaction),
      })
    */

    // Clear form after adding
    setDate("");
    setPayee("");
    setMemo("");
    setPayment(0);
    setDeposit(0);
  };

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bank Register</h1>

        {/* 
          BACKEND REQUIRED:
          This balance should come from database
        */}
        <div className="text-lg font-bold">
          Ending Balance: $
          {transactions.length > 0
            ? transactions[transactions.length - 1].balance.toFixed(2)
            : "0.00"}
        </div>
      </div>

      {/* Add Transaction Form */}
<div className="mb-6 grid grid-cols-6 gap-4 border p-4 rounded-md">

  {/* DATE INPUT */}
  <input
    type="date"
    value={date}
    onChange={(e) => setDate(e.target.value)}
    onKeyDown={(e) => e.preventDefault()} 
    /*
      onKeyDown prevents manual typing.
      User MUST use the calendar popup.
    */
    className="border p-1 rounded cursor-pointer"
  />

  {/* PAYEE INPUT (Letters + Numbers only) */}
  <input
    type="text"
    placeholder="Payee"
    value={payee}
    onChange={(e) => {
      const value = e.target.value;

      /*
        Regex Explanation:
        ^[a-zA-Z0-9\s]*$
        - letters
        - numbers
        - spaces
        - unlimited length
      */
      if (/^[a-zA-Z0-9\s]*$/.test(value)) {
        setPayee(value);
      }
    }}
    className="border p-2 rounded"
  />

  {/* MEMO INPUT (Letters + Numbers only) */}
  <input
    type="text"
    placeholder="Memo"
    value={memo}
    onChange={(e) => {
      const value = e.target.value;

      if (/^[a-zA-Z0-9\s]*$/.test(value)) {
        setMemo(value);
      }
    }}
    className="border p-2 rounded"
  />

  {/* PAYMENT INPUT (Numbers + decimal only) */}
  <input
    type="text"
    placeholder="Payment"
    value={payment === 0 ? "" : payment}
    onChange={(e) => {
      const value = e.target.value;

      /*
        Allows:
        - digits
        - one decimal point
      */
      if (/^\d*\.?\d*$/.test(value)) {
        setPayment(Number(value));
      }
    }}
    className="border p-2 rounded"
  />

  {/* DEPOSIT INPUT (Numbers + decimal only) */}
  <input
    type="text"
    placeholder="Deposit"
    value={deposit === 0 ? "" : deposit}
    onChange={(e) => {
      const value = e.target.value;

      if (/^\d*\.?\d*$/.test(value)) {
        setDeposit(Number(value));
      }
    }}
    className="border p-2 rounded"
  />

  <button
    onClick={handleAddTransaction}
    className="bg-[#F87171] text-white rounded px-4 py-2"
  >
    Add
  </button>
</div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-black-100">
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Payee</th>
              <th className="border p-2">Memo</th>
              <th className="border p-2">Payment</th>
              <th className="border p-2">Deposit</th>
              <th className="border p-2">Balance</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="border p-2">{t.date}</td>
                <td className="border p-2">{t.payee}</td>
                <td className="border p-2">{t.memo}</td>
                <td className="border p-2 text-red-500">
                  {t.payment > 0 ? `$${t.payment.toFixed(2)}` : ""}
                </td>
                <td className="border p-2 text-green-600">
                  {t.deposit > 0 ? `$${t.deposit.toFixed(2)}` : ""}
                </td>
                <td className="border p-2 font-semibold">
                  ${t.balance.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}