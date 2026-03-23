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
    Class: string; // "Deposit", "Income", "Expense", "Payment"
};

export default function Entries() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [funds, setFunds] = useState<Fund[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());

    const centeredGrid = {
        alignItems: "center",
        justifyItems: "center",
        textAlign: "center" as const,
    };

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
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const getFundsForEntry = (entryID: number) => {
        return funds.filter(fund => fund.EntryID === entryID);
    };

    const getDepositPayment = (entryID: number) => {
        const entryFunds = getFundsForEntry(entryID);
        let deposit = 0;
        let payment = 0;

        entryFunds.forEach(fund => {
            const cls = fund.Class.toLowerCase();
            if (cls === "deposit" || cls === "income") {
                deposit += fund.Amount;
            } else if (cls === "payment" || cls === "expense" || cls === "spend") {
                payment += fund.Amount;
            }
        });

        return {
            deposit: deposit > 0 ? deposit : null,
            payment: payment > 0 ? payment : null,
        };
    };

    const toggleExpanded = (entryID: number) => {
        const newSet = new Set(expandedEntries);
        if (newSet.has(entryID)) newSet.delete(entryID);
        else newSet.add(entryID);
        setExpandedEntries(newSet);
    };

    const formatDate = (date: Date | string) => {
        try {
            return new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return String(date);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center w-full min-h-screen" style={{ backgroundColor: "#F9FAFB" }}>
                <div style={{ color: "#4B5563" }}>Loading entries...</div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen" style={{ backgroundColor: "#F9FAFB" }}>
            <div style={{ width: "100%" }}>
                
                {/* Header */}
                <div style={{ marginBottom: "2rem", padding: "1rem" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1F2937" }}>
                        Entries
                    </h1>
                    <p style={{ color: "#6B7280", fontSize: "0.875rem" }}>
                        {entries.length} {entries.length === 1 ? "entry" : "entries"}
                    </p>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1D5DB" }}>
                    
                    {/* Table Header */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "50px 100px 150px 150px 120px 80px 80px 100px 100px 100px 50px",
                            padding: "1rem",
                            backgroundColor: "#F3F4F6",
                            borderBottom: "1px solid #D1D5DB",
                            fontWeight: "600",
                            fontSize: "0.875rem",
                            ...centeredGrid,
                        }}
                    >
                        <div></div>
                        <div>Transaction</div>
                        <div>Location</div>
                        <div>Memo</div>
                        <div>Date</div>
                        <div>Register</div>
                        <div>Void</div>
                        <div>Reconciled</div>
                        <div>Deposit</div>
                        <div>Payment</div>
                        <div>Type</div>
                    </div>

                    {/* Rows */}
                    {entries.map((entry, index) => {
                        const entryFunds = getFundsForEntry(entry.ID);
                        const isExpanded = expandedEntries.has(entry.ID);
                        const isClickable = entryFunds.length > 0;

                        const { deposit, payment } = getDepositPayment(entry.ID);

                        return (
                            <div key={entry.ID}>
                                
                                {/* Entry Row */}
                                <div
                                    onClick={isClickable ? () => toggleExpanded(entry.ID) : undefined}
                                    onMouseEnter={(e) => {
                                        if (isClickable) e.currentTarget.style.backgroundColor = "#F3F4F6";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            index % 2 === 0 ? "#FFFFFF" : "#F9FAFB";
                                    }}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "50px 100px 150px 150px 120px 80px 80px 100px 100px 100px 50px",
                                        padding: "1rem",
                                        borderBottom: "1px solid #D1D5DB",
                                        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
                                        cursor: isClickable ? "pointer" : "default",
                                        opacity: isClickable ? 1 : 0.8,
                                        ...centeredGrid,
                                    }}
                                >
                                    {/* Expand */}
                                    <div>
                                        {isClickable && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleExpanded(entry.ID);
                                                }}
                                            >
                                                {isExpanded ? "−" : "+"}
                                            </button>
                                        )}
                                    </div>

                                    <div>{entry.TransactionID}</div>
                                    <div>{entry.Location}</div>
                                    <div>{entry.Memo}</div>
                                    <div>{formatDate(entry.Date)}</div>
                                    <div>{entry.RegisterID}</div>
                                    <div>{entry.Void ? "Yes" : "No"}</div>
                                    <div>{entry.Rec ? "Yes" : "No"}</div>

                                    {/* Deposit / Payment */}
                                    <div>{deposit !== null ? formatCurrency(deposit) : ""}</div>
                                    <div>{payment !== null ? formatCurrency(payment) : ""}</div>

                                    <div>{entry.EntryType}</div>
                                </div>

                                {/* Funds */}
                                {isClickable && isExpanded && (
                                    <div style={{ backgroundColor: "#F9FAFB" }}>
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "100px 120px 150px 150px 120px 100px 80px",
                                                padding: "1rem 1rem 0.5rem 3rem",
                                                fontWeight: "600",
                                                fontSize: "0.875rem",
                                                ...centeredGrid,
                                            }}
                                        >
                                            <div>Account ID</div>
                                            <div>Target</div>
                                            <div>Description</div>
                                            <div>Payment Method</div>
                                            <div>Reference #</div>
                                            <div>Amount</div>
                                            <div>Class</div>
                                        </div>

                                        {entryFunds.map((fund) => (
                                            <div
                                                key={fund.ID}
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "100px 120px 150px 150px 120px 100px 80px",
                                                    padding: "0.75rem 1rem 0.75rem 3rem",
                                                    borderTop: "1px solid #E5E7EB",
                                                    backgroundColor: "#FFFFFF",
                                                    ...centeredGrid,
                                                }}
                                            >
                                                <div>{fund.AccountID}</div>
                                                <div>{fund.Target}</div>
                                                <div>{fund.Description}</div>
                                                <div>{fund.PaymentMethod}</div>
                                                <div>{fund.ReferenceNumber}</div>
                                                <div>{formatCurrency(fund.Amount)}</div>
                                                <div>{fund.Class}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}