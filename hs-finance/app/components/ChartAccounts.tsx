"use client";
import { useState, useEffect } from "react";

type Account = {
    ID: number;
    AccountName: string;
};

export default function ChartAccounts() {
    //Creates a list of accounts and fetches from server
    const [accounts, setAccounts] = useState<Account[]>([]);
    useEffect(()=> {
        async function fetchChartAccounts() {
            const res = await fetch("/api/chartAccounts");
            const data = await res.json();
            setAccounts(data);
        }
        fetchChartAccounts();
    }, []);

    //Creates a div of divs with account names, has an empty div if no accounts fetched.
    return (
        <div>
            {(accounts.length>0) && (accounts.map((account)=> (
                <div key={account.ID}>{account.AccountName}</div>
            )))}
        </div>
    )
}