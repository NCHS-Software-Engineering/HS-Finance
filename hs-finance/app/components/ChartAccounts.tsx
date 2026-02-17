
"use client";
import { useState, useEffect } from "react";

type Account = {
    id: number;
    name: string;
};

export default function ChartAccounts() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    useEffect(()=> {
        async function fetchChartAccounts() {
            const res = await fetch("/api/chartAccounts");
            const data = await res.json();
            setAccounts(data);
        }
        fetchChartAccounts();
    }, []);

    return (
        <div>
            {accounts.map((account)=> (
                <div>{account.name}</div>
            ))}
        </div>
    )
}