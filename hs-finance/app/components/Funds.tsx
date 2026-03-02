"use client";
import { useState, useEffect } from "react";

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

export default function Registers() {
    //Creates a list of accounts and fetches from server
    const [funds, setFunds] = useState<Fund[]>([]);
    useEffect(()=> {
        async function fetchFunds(){
            const res = await fetch("/api/funds");
            const data = await res.json();
            setFunds(data);
        }
        fetchFunds();
    }, []);

    //Creates a div of divs with account names, has an empty div if no accounts fetched.
    return (
        <div>
            {(funds.length>0) && (funds.map((fund)=> (
                <div key={fund.ID}>{
                                        fund.EntryID+", "+
                                        fund.AccountID+", "+
                                        fund.Target+", "+
                                        fund.Description+", "+
                                        fund.PaymentMethod+", "+
                                        fund.ReferenceNumber+", "+
                                        fund.Amount+", "+
                                        fund.Class
                                    }</div>
            )))}
        </div>
    )
}