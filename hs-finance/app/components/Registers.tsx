"use client";
import { useState, useEffect } from "react";

type Register = {
    ID: number;
    RegisterName: string;
};

export default function Registers() {
    //Creates a list of accounts and fetches from server
    const [registers, setRegisters] = useState<Register[]>([]);
    useEffect(()=> {
        async function fetchRegisters() {
            const res = await fetch("/api/registers");
            const data = await res.json();
            setRegisters(data);
        }
        fetchRegisters();
    }, []);

    //Creates a div of divs with account names, has an empty div if no accounts fetched.
    return (
        <div>
            {(registers.length>0) && (registers.map((register)=> (
                <div key={register.ID}>{register.RegisterName}</div>
            )))}
        </div>
    )
}