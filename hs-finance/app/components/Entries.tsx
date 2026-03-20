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
    const [loading, setLoading] = useState(true);
    const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());

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

    const toggleExpanded = (entryID: number) => {
        const newSet = new Set(expandedEntries);
        if (newSet.has(entryID)) {
            newSet.delete(entryID);
        } else {
            newSet.add(entryID);
        }
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
                <div className="text-base" style={{ color: "#4B5563" }}>Loading entries...</div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen" style={{ backgroundColor: "#F9FAFB", paddingTop: "2rem", paddingBottom: "2rem" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", paddingLeft: "1rem", paddingRight: "1rem" }}>
                {/* Header */}
                <div style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1F2937", marginBottom: "0.5rem" }}>
                        Entries
                    </h1>
                    <p style={{ color: "#6B7280", fontSize: "0.875rem" }}>
                        {entries.length} {entries.length === 1 ? "entry" : "entries"}
                    </p>
                </div>

                {entries.length === 0 ? (
                    <div
                        style={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #D1D5DB",
                            borderRadius: "8px",
                            padding: "2rem",
                            textAlign: "center",
                        }}
                    >
                        <p style={{ color: "#6B7280" }}>No entries found</p>
                    </div>
                ) : (
                    <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #D1D5DB", overflow: "hidden" }}>
                        {/* Table Header */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "50px 100px 150px 150px 120px 80px 80px 100px 50px",
                                gap: "1rem",
                                padding: "1rem",
                                backgroundColor: "#F3F4F6",
                                borderBottom: "1px solid #D1D5DB",
                                fontWeight: "600",
                                fontSize: "0.875rem",
                                color: "#4B5563",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
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
                            <div>Type</div>
                        </div>

                        {/* Table Rows */}
                        <div>
                            {entries.map((entry, index) => {
                                const entryFunds = getFundsForEntry(entry.ID);
                                const isExpanded = expandedEntries.has(entry.ID);

                                return (
                                    <div key={`entry-${entry.ID}`}>
                                        {/* Entry Row */}
                                        <div
                                            onClick={() => entryFunds.length > 0 && toggleExpanded(entry.ID)}
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "50px 100px 150px 150px 120px 80px 80px 100px 50px",
                                                gap: "1rem",
                                                padding: "1rem",
                                                borderBottom: "1px solid #D1D5DB",
                                                backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
                                                cursor: entryFunds.length > 0 ? "pointer" : "default",
                                                transition: "background-color 0.2s",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (entryFunds.length > 0) {
                                                    e.currentTarget.style.backgroundColor = "#F3F4F6";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#FFFFFF" : "#F9FAFB";
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {entryFunds.length > 0 ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleExpanded(entry.ID);
                                                        }}
                                                        style={{
                                                            background: "none",
                                                            border: "none",
                                                            cursor: "pointer",
                                                            color: isExpanded ? "#FCA5A5" : "#6B7280",
                                                            fontSize: "1.25rem",
                                                            padding: "0",
                                                            lineHeight: "1",
                                                        }}
                                                    >
                                                        {isExpanded ? "−" : "+"}
                                                    </button>
                                                ) : null}
                                            </div>
                                            <div style={{ color: "#1F2937", fontSize: "0.9375rem", fontWeight: "500" }}>
                                                {entry.TransactionID}
                                            </div>
                                            <div style={{ color: "#1F2937", fontSize: "0.9375rem" }}>
                                                {entry.Location}
                                            </div>
                                            <div style={{ color: "#1F2937", fontSize: "0.9375rem" }}>
                                                {entry.Memo}
                                            </div>
                                            <div style={{ color: "#1F2937", fontSize: "0.9375rem" }}>
                                                {formatDate(entry.Date)}
                                            </div>
                                            <div style={{ color: "#1F2937", fontSize: "0.9375rem" }}>
                                                {entry.RegisterID}
                                            </div>
                                            <div style={{ color: entry.Void ? "#B91C1C" : "#16A34A", fontSize: "0.9375rem", fontWeight: "500" }}>
                                                {entry.Void ? "Yes" : "No"}
                                            </div>
                                            <div style={{ color: entry.Rec ? "#16A34A" : "#B91C1C", fontSize: "0.9375rem", fontWeight: "500" }}>
                                                {entry.Rec ? "Yes" : "No"}
                                            </div>
                                            <div style={{ color: "#1F2937", fontSize: "0.9375rem" }}>
                                                {entry.EntryType}
                                            </div>
                                        </div>

                                        {/* Expanded Funds Section */}
                                        {entryFunds.length > 0 && isExpanded && (
                                            <div style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #D1D5DB" }}>
                                                {/* Funds Header */}
                                                <div
                                                    style={{
                                                        padding: "1rem 1rem 0.5rem 3rem",
                                                        fontSize: "0.875rem",
                                                        fontWeight: "600",
                                                        color: "#4B5563",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.5px",
                                                        display: "grid",
                                                        gridTemplateColumns: "100px 120px 150px 150px 120px 100px 80px",
                                                        gap: "1rem",
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

                                                {/* Funds Rows */}
                                                <div>
                                                    {entryFunds.map((fund) => (
                                                        <div
                                                            key={`fund-${fund.ID}`}
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns: "100px 120px 150px 150px 120px 100px 80px",
                                                                gap: "1rem",
                                                                padding: "0.75rem 1rem 0.75rem 3rem",
                                                                borderTop: "1px solid #E5E7EB",
                                                                backgroundColor: "#FFFFFF",
                                                                fontSize: "0.9375rem",
                                                                color: "#1F2937",
                                                                alignItems: "center",
                                                            }}
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns: "100px 120px 150px 150px 120px 100px 80px",
                                                                gap: "1rem",
                                                                padding: "0.75rem 1rem 0.75rem 3rem",
                                                                borderTop: "1px solid #E5E7EB",
                                                                backgroundColor: "#FFFFFF",
                                                                fontSize: "0.9375rem",
                                                                color: "#1F2937",
                                                                alignItems: "center",
                                                                position: "relative",
                                                            }}
                                                        >
                                                            {/* Indent marker */}
                                                            <div
                                                                style={{
                                                                    position: "absolute",
                                                                    left: "1rem",
                                                                    color: "#D1D5DB",
                                                                    fontSize: "0.875rem",
                                                                    fontWeight: "600",
                                                                }}
                                                            >
                                                                ├─
                                                            </div>
                                                            <div>{fund.AccountID}</div>
                                                            <div>{fund.Target}</div>
                                                            <div>{fund.Description}</div>
                                                            <div>{fund.PaymentMethod}</div>
                                                            <div>{fund.ReferenceNumber}</div>
                                                            <div style={{ color: "#16A34A", fontWeight: "500" }}>
                                                                {formatCurrency(fund.Amount)}
                                                            </div>
                                                            <div>{fund.Class}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}