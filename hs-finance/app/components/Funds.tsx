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

export default function Registers() {
    //Creates a list of accounts and fetches from server
    const [entries, setEntries] = useState<Entry[]>([]);
    useEffect(()=> {
        async function fetchEntries() {
            const res = await fetch("/api/entries");
            const data = await res.json();
            setEntries(data);
        }
        fetchEntries();
    }, []);

    //Creates a div of divs with account names, has an empty div if no accounts fetched.
    return (
        <div>
            {(entries.length>0) && (entries.map((entry)=> (
                <div key={entry.ID}>{
                                        entry.TransactionID+", "+
                                        entry.Location+", "+
                                        entry.Memo+", "+
                                        entry.Date+", "+
                                        entry.RegisterID+", "+
                                        entry.Void+", "+
                                        entry.Rec+", "+
                                        entry.EntryType
                                    }</div>
            )))}
        </div>
    )
}