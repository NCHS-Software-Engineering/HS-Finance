"use client";
import { useState, useEffect } from "react";
import type { Entry, Fund } from "../types";

// Style Guide Tokens
const sg = {
    // Primary Interaction
    brand: "#FCA5A5",
    brandHover: "#F87171",
    secondary: "#FECACA",
    highlight: "#FFE4E4",

    // Neutrals
    textPrimary: "#1F2937",
    textSecondary: "#4B5563",
    textMuted: "#6B7280",
    bgPage: "#F9FAFB",
    bgPanel: "#FFFFFF",
    border: "#D1D5DB",
    disabled: "#9CA3AF",

    // Supporting UI
    hoverBg: "#F3F4F6",
    disabledBtn: "#E5E7EB",

    // Status
    success: "#16A34A",
    successBg: "#DCFCE7",
    error: "#B91C1C",
    warning: "#F59E0B",
    info: "#0EA5E9",

    // Font
    font: "'IBM Plex Mono', monospace",
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
                setEntries(Array.isArray(entriesData) ? entriesData : entriesData.entries ?? []);

                const fundsRes = await fetch("/api/funds");
                const fundsData = await fundsRes.json();
                setFunds(Array.isArray(fundsData) ? fundsData : fundsData.funds ?? []);
            } catch (error) {
                console.error("Error fetching data:", error);
                setEntries([]);
                setFunds([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const getFundsForEntry = (entryID: number) =>
        funds.filter(f => Number(f.EntryID) === Number(entryID));

    const getDepositPayment = (entryID: number) => {
        let deposit = 0;
        let payment = 0;
        getFundsForEntry(entryID).forEach(fund => {
            const cls = fund.Class.toLowerCase();
            if (cls === "deposit" || cls === "income") deposit += fund.Amount;
            else if (cls === "payment" || cls === "expense" || cls === "spend") payment += fund.Amount;
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
            return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        } catch {
            return String(date);
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

    if (loading) {
        return (
            <div style={{
                display: "flex", justifyContent: "center", alignItems: "center",
                minHeight: "100vh", backgroundColor: sg.bgPage, fontFamily: sg.font,
            }}>
                <div style={{ color: sg.textSecondary, fontSize: "0.875rem" }}>Loading entries...</div>
            </div>
        );
    }

    const entryColumns = "32px 1fr 1.2fr 1.5fr 110px 70px 70px 90px 100px 100px 80px";
    const fundColumns = "90px 100px 1fr 1.2fr 110px 100px 80px";

    const cellStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 4px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontFamily: sg.font,
    };

    return (
        <div style={{ backgroundColor: sg.bgPage, minHeight: "100vh", padding: "2rem", fontFamily: sg.font }}>

            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: sg.textPrimary,
                    fontFamily: sg.font,
                    margin: 0,
                }}>
                    Entries
                </h1>
                <p style={{ color: sg.textMuted, fontSize: "0.875rem", marginTop: "0.25rem", fontWeight: 400 }}>
                    {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </p>
            </div>

            {/* Table Card */}
            <div style={{
                backgroundColor: sg.bgPanel,
                border: `1px solid ${sg.border}`,
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}>

                {/* Table Header */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: entryColumns,
                    padding: "0.75rem 1rem",
                    backgroundColor: sg.hoverBg,
                    borderBottom: `2px solid ${sg.border}`,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: sg.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontFamily: sg.font,
                }}>
                    <div />
                    <div style={cellStyle}>Transaction</div>
                    <div style={cellStyle}>Location</div>
                    <div style={cellStyle}>Memo</div>
                    <div style={cellStyle}>Date</div>
                    <div style={cellStyle}>Register</div>
                    <div style={cellStyle}>Void</div>
                    <div style={cellStyle}>Reconciled</div>
                    <div style={cellStyle}>Deposit</div>
                    <div style={cellStyle}>Payment</div>
                    <div style={cellStyle}>Type</div>
                </div>

                {entries.length === 0 && (
                    <div style={{ padding: "2rem", textAlign: "center", color: sg.disabled, fontFamily: sg.font }}>
                        No entries found.
                    </div>
                )}

                {entries.map((entry, index) => {
                    const entryFunds = getFundsForEntry(entry.ID);
                    const isExpanded = expandedEntries.has(entry.ID);
                    const hasFunds = entryFunds.length > 0;
                    const { deposit, payment } = getDepositPayment(entry.ID);
                    const isEven = index % 2 === 0;
                    const rowBg = isExpanded ? sg.highlight : isEven ? sg.bgPanel : sg.bgPage;

                    return (
                        <div key={entry.ID} style={{ borderBottom: `1px solid ${sg.border}` }}>

                            {/* Entry Row */}
                            <div
                                onClick={hasFunds ? () => toggleExpanded(entry.ID) : undefined}
                                onMouseEnter={e => {
                                    if (hasFunds)(e.currentTarget as HTMLDivElement).style.backgroundColor = sg.hoverBg;
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLDivElement).style.backgroundColor = rowBg;
                                }}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: entryColumns,
                                    padding: "0.75rem 1rem",
                                    backgroundColor: rowBg,
                                    cursor: hasFunds ? "pointer" : "default",
                                    fontSize: "0.875rem",
                                    color: sg.textPrimary,
                                    fontFamily: sg.font,
                                    fontWeight: 400,
                                    alignItems: "center",
                                }}
                            >
                                {/* Chevron */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {hasFunds && (
                                        <span style={{
                                            fontSize: "0.6rem",
                                            color: sg.textMuted,
                                            display: "inline-block",
                                            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                            userSelect: "none",
                                        }}>
                                            ▶
                                        </span>
                                    )}
                                </div>

                                <div style={cellStyle}>{entry.TransactionID}</div>
                                <div style={cellStyle}>{entry.Location}</div>
                                <div style={cellStyle}>{entry.Memo}</div>
                                <div style={cellStyle}>{formatDate(entry.Date)}</div>
                                <div style={cellStyle}>{entry.RegisterID}</div>
                                <div style={cellStyle}>{entry.Void ? "Yes" : "No"}</div>
                                <div style={cellStyle}>{entry.Rec ? "Yes" : "No"}</div>

                                {/* Deposit — success green (status color, meaningful use) */}
                                <div style={{ ...cellStyle, color: deposit !== null ? sg.success : sg.textPrimary, fontWeight: deposit !== null ? 600 : 400 }}>
                                    {deposit !== null ? formatCurrency(deposit) : ""}
                                </div>

                                {/* Payment — error red (status color, meaningful use) */}
                                <div style={{ ...cellStyle, color: payment !== null ? sg.error : sg.textPrimary, fontWeight: payment !== null ? 600 : 400 }}>
                                    {payment !== null ? formatCurrency(payment) : ""}
                                </div>

                                <div style={cellStyle}>{entry.EntryType}</div>
                            </div>

                            {/* Expanded Funds Panel */}
                            {hasFunds && isExpanded && (
                                <div style={{
                                    backgroundColor: sg.highlight,
                                    borderTop: `1px solid ${sg.secondary}`,
                                    borderLeft: `4px solid ${sg.brand}`,
                                    marginLeft: "1rem",
                                }}>
                                    {/* Funds Sub-header */}
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: fundColumns,
                                        padding: "0.5rem 1rem",
                                        fontWeight: 600,
                                        fontSize: "0.7rem",
                                        color: sg.textMuted,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        borderBottom: `1px solid ${sg.secondary}`,
                                        fontFamily: sg.font,
                                    }}>
                                        <div style={cellStyle}>Fund ID</div>
                                        <div style={cellStyle}>Account ID</div>
                                        <div style={cellStyle}>Target</div>
                                        <div style={cellStyle}>Description</div>
                                        <div style={cellStyle}>Pay Method</div>
                                        <div style={cellStyle}>Amount</div>
                                        <div style={cellStyle}>Class</div>
                                    </div>

                                    {/* Fund Rows */}
                                    {entryFunds.map((fund, fi) => {
                                        const isIncome = fund.Class.toLowerCase() === "deposit" || fund.Class.toLowerCase() === "income";
                                        const fundRowBg = fi % 2 === 0 ? sg.highlight : sg.bgPanel;

                                        return (
                                            <div
                                                key={fund.ID}
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: fundColumns,
                                                    padding: "0.6rem 1rem",
                                                    fontSize: "0.85rem",
                                                    color: sg.textPrimary,
                                                    backgroundColor: fundRowBg,
                                                    borderBottom: fi < entryFunds.length - 1 ? `1px solid ${sg.secondary}` : "none",
                                                    fontFamily: sg.font,
                                                    fontWeight: 400,
                                                    alignItems: "center",
                                                }}
                                            >
                                                {/* Fund ID — brand color since it's an interactive/key identifier */}
                                                <div style={{ ...cellStyle, fontWeight: 600, color: sg.brandHover }}>
                                                    #{fund.ID}
                                                </div>
                                                <div style={cellStyle}>{fund.AccountID}</div>
                                                <div style={cellStyle}>{fund.Target}</div>
                                                <div style={cellStyle}>{fund.Description}</div>
                                                <div style={cellStyle}>{fund.PaymentMethod}</div>
                                                <div style={{
                                                    ...cellStyle,
                                                    fontWeight: 600,
                                                    color: isIncome ? sg.success : sg.error,
                                                }}>
                                                    {formatCurrency(fund.Amount)}
                                                </div>
                                                {/* Class badge using brand palette */}
                                                <div style={{ ...cellStyle }}>
                                                    <span style={{
                                                        backgroundColor: sg.secondary,
                                                        color: sg.textPrimary,
                                                        borderRadius: "9999px",
                                                        padding: "2px 10px",
                                                        fontSize: "0.7rem",
                                                        fontWeight: 500,
                                                        fontFamily: sg.font,
                                                    }}>
                                                        {fund.Class}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Fund count */}
                                    <div style={{
                                        padding: "0.4rem 1rem",
                                        fontSize: "0.75rem",
                                        color: sg.textMuted,
                                        fontFamily: sg.font,
                                        fontWeight: 400,
                                    }}>
                                        {entryFunds.length} fund{entryFunds.length !== 1 ? "s" : ""} linked to this entry
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}