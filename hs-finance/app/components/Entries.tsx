"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Entry, Fund, Transaction, Register } from "../types";

const sg = {
    brand: "#FCA5A5",
    brandHover: "#F87171",
    secondary: "#FECACA",
    highlight: "#FFE4E4",
    textPrimary: "#1F2937",
    textSecondary: "#4B5563",
    textMuted: "#6B7280",
    bgPage: "#F9FAFB",
    bgPanel: "#FFFFFF",
    border: "#D1D5DB",
    disabled: "#9CA3AF",
    hoverBg: "#F3F4F6",
    disabledBtn: "#E5E7EB",
    success: "#16A34A",
    successBg: "#DCFCE7",
    error: "#B91C1C",
    warning: "#F59E0B",
    info: "#0EA5E9",
    font: "'IBM Plex Mono', monospace",
};

type EntryFormData = {
    TransactionID: number;
    Location: string;
    Memo: string;
    Date: string;
    RegisterID: string;
    Void: boolean;
    Rec: boolean;
    EntryType: "single" | "group";
    ClassID: string;
};

const TRANSACTION_TYPES = [
    { label: "Deposit",         id: 1 },
    { label: "Expenditure",     id: 2 },
    { label: "Transfer",        id: 3 },
    { label: "Payment",         id: 4 },
    { label: "Check (Deposit)", id: 5 },
    { label: "Check (Payment)", id: 6 },
    { label: "Transfer Out",    id: 7 },
] as const;

export default function Entries() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [funds, setFunds] = useState<Fund[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [registers, setRegisters] = useState<Register[]>([]);
    const [selectedRegisterID, setSelectedRegisterID] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EntryFormData>({
        defaultValues: {
            Void: false,
            Rec: false,
        },
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const [entriesRes, fundsRes, transactionsRes, registersRes] = await Promise.all([
                    fetch("/api/entries"),
                    fetch("/api/funds"),
                    fetch("/api/transactions"),
                    fetch("/api/registers"),
                ]);

                const entriesData = await entriesRes.json();
                setEntries(Array.isArray(entriesData) ? entriesData : entriesData.entries ?? []);

                const fundsData = await fundsRes.json();
                setFunds(Array.isArray(fundsData) ? fundsData : fundsData.funds ?? []);

                const transactionsData = await transactionsRes.json();
                setTransactions(Array.isArray(transactionsData) ? transactionsData : transactionsData.transactions ?? []);

                const registersData = await registersRes.json();
                const registerList: Register[] = Array.isArray(registersData) ? registersData : registersData.registers ?? [];
                setRegisters(registerList);

                if (registerList.length > 0) {
                    setSelectedRegisterID(String(registerList[0].ID));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setEntries([]);
                setFunds([]);
                setTransactions([]);
                setRegisters([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredEntries = selectedRegisterID
        ? entries.filter(e => String(e.RegisterID) === selectedRegisterID)
        : entries;

    const onSubmit = async (data: EntryFormData) => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            const res = await fetch("/api/entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error(`Server responded with ${res.status}`);

            const newEntry: Entry = await res.json();
            setEntries(prev => [newEntry, ...prev]);
            setSubmitSuccess(true);
            reset();

            setTimeout(() => {
                setShowForm(false);
                setSubmitSuccess(false);
            }, 1500);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Failed to create entry.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelForm = () => {
        reset();
        setSubmitError(null);
        setSubmitSuccess(false);
        setShowForm(false);
    };

    const getFundsForEntry = (entryID: number) =>
        funds.filter(f => Number(f.EntryID) === Number(entryID));

    const getDepositPayment = (entry: Entry) => {
        let deposit = 0;
        let payment = 0;
        const transaction = transactions.find(t => Number(t.ID) === Number(entry.TransactionID));
        getFundsForEntry(entry.ID).forEach(fund => {
            if (transaction?.MoneyIn === 1) deposit += fund.Amount;
            else payment += Math.abs(fund.Amount);
        });
        return {
            deposit: deposit > 0 ? deposit : null,
            payment: payment > 0 ? payment : null,
        };
    };

    const toggleExpanded = (entryID: number) => {
        setExpandedEntries(prev => {
            const next = new Set(prev);
            if (next.has(entryID)) next.delete(entryID);
            else next.add(entryID);
            return next;
        });
    };

    const formatDate = (date: Date | string) => {
        try {
            return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        } catch {
            return String(date);
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(amount));

    const totalDeposits = filteredEntries.reduce((sum, entry) => {
        const transaction = transactions.find(t => Number(t.ID) === Number(entry.TransactionID));
        if (transaction?.MoneyIn === 1) {
            return sum + getFundsForEntry(entry.ID).reduce((s, f) => s + f.Amount, 0);
        }
        return sum;
    }, 0);

    const totalPayments = filteredEntries.reduce((sum, entry) => {
        const transaction = transactions.find(t => Number(t.ID) === Number(entry.TransactionID));
        if (transaction?.MoneyIn !== 1) {
            return sum + getFundsForEntry(entry.ID).reduce((s, f) => s + Math.abs(f.Amount), 0);
        }
        return sum;
    }, 0);

    const netTotal = totalDeposits - totalPayments;

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
    const fundColumns = "90px 100px 1fr 1.2fr 110px 100px";

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

    const inputStyle = (hasError: boolean): React.CSSProperties => ({
        width: "100%",
        padding: "0.4rem 0.5rem",
        fontFamily: sg.font,
        fontSize: "0.8rem",
        color: sg.textPrimary,
        backgroundColor: sg.bgPanel,
        border: `1px solid ${hasError ? sg.error : sg.border}`,
        borderRadius: "4px",
        outline: "none",
        boxSizing: "border-box",
    });

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "0.65rem",
        fontWeight: 600,
        color: sg.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: "0.3rem",
        fontFamily: sg.font,
    };

    const fieldErrorStyle: React.CSSProperties = {
        fontSize: "0.65rem",
        color: sg.error,
        marginTop: "0.2rem",
        fontFamily: sg.font,
    };

    const selectedRegister = registers.find(r => String(r.ID) === selectedRegisterID);

    return (
        <div style={{ backgroundColor: sg.bgPage, minHeight: "100vh", padding: "2rem", fontFamily: sg.font }}>

            {/* Header */}
            <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
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
                        {filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"}
                        {selectedRegister ? ` · ${selectedRegister.RegisterName}` : ""}
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem" }}>
                    <span style={{
                        fontSize: "0.7rem", fontWeight: 600, color: sg.textMuted,
                        fontFamily: sg.font, textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>
                        Net Total
                    </span>
                    <span style={{
                        fontSize: "2rem", fontWeight: 700, fontFamily: sg.font,
                        color: netTotal >= 0 ? sg.success : sg.error, lineHeight: 1,
                    }}>
                        {formatCurrency(Math.abs(netTotal))}
                    </span>
                    <span style={{
                        fontSize: "0.7rem", fontWeight: 400, fontFamily: sg.font,
                        color: netTotal >= 0 ? sg.success : sg.error, opacity: 0.75,
                    }}>
                        {netTotal >= 0 ? "▲ surplus" : "▼ deficit"}
                    </span>
                </div>
            </div>

            {/* Table Card */}
            <div style={{
                backgroundColor: sg.bgPanel,
                border: `1px solid ${sg.border}`,
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}>

                {/* Toolbar */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 1rem",
                    borderBottom: `1px solid ${sg.border}`,
                    backgroundColor: sg.bgPanel,
                    gap: "1rem",
                }}>
                    {/* Register Selector — left side */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <label style={{
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            color: sg.textMuted,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            fontFamily: sg.font,
                            whiteSpace: "nowrap",
                        }}>
                            Register
                        </label>
                        <select
                            value={selectedRegisterID}
                            onChange={e => {
                                setSelectedRegisterID(e.target.value);
                                setExpandedEntries(new Set());
                            }}
                            style={{
                                padding: "0.4rem 2rem 0.4rem 0.6rem",
                                fontFamily: sg.font,
                                fontSize: "0.8rem",
                                color: sg.textPrimary,
                                backgroundColor: sg.bgPanel,
                                border: `1px solid ${sg.border}`,
                                borderRadius: "4px",
                                outline: "none",
                                cursor: "pointer",
                                appearance: "none",
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 0.5rem center",
                                minWidth: "180px",
                            }}
                        >
                            {registers.length === 0 && (
                                <option value="">No registers found</option>
                            )}
                            {registers.map(r => (
                                <option key={r.ID} value={String(r.ID)}>
                                    {r.RegisterName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Add Entry Button — right side */}
                    <button
                        onClick={() => setShowForm(v => !v)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            padding: "0.45rem 0.9rem",
                            backgroundColor: showForm ? sg.secondary : sg.brand,
                            color: sg.textPrimary,
                            border: "none",
                            borderRadius: "5px",
                            fontFamily: sg.font,
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = sg.brandHover)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = showForm ? sg.secondary : sg.brand)}
                    >
                        <span style={{ fontSize: "1rem", lineHeight: 1 }}>{showForm ? "✕" : "+"}</span>
                        {showForm ? "Cancel" : "Add Entry"}
                    </button>
                </div>

                {/* Inline Add Entry Form */}
                {showForm && (
                    <div style={{
                        backgroundColor: sg.highlight,
                        borderBottom: `2px solid ${sg.brand}`,
                        borderLeft: `4px solid ${sg.brand}`,
                        padding: "1.25rem 1.5rem",
                    }}>
                        <p style={{
                            margin: "0 0 1rem 0",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            color: sg.brandHover,
                            fontFamily: sg.font,
                        }}>
                            New Entry
                        </p>

                        {submitSuccess && (
                            <div style={{
                                marginBottom: "1rem",
                                padding: "0.6rem 0.9rem",
                                backgroundColor: sg.successBg,
                                border: `1px solid ${sg.success}`,
                                borderRadius: "4px",
                                fontSize: "0.78rem",
                                color: sg.success,
                                fontFamily: sg.font,
                                fontWeight: 600,
                            }}>
                                ✓ Entry created successfully
                            </div>
                        )}
                        {submitError && (
                            <div style={{
                                marginBottom: "1rem",
                                padding: "0.6rem 0.9rem",
                                backgroundColor: "#FEE2E2",
                                border: `1px solid ${sg.error}`,
                                borderRadius: "4px",
                                fontSize: "0.78rem",
                                color: sg.error,
                                fontFamily: sg.font,
                                fontWeight: 600,
                            }}>
                                ✗ {submitError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>

                            {/* Row 1: Transaction Type, Location, Memo, Date */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1.5fr 1fr",
                                gap: "0.85rem",
                                marginBottom: "0.85rem",
                            }}>
                                <div>
                                    <label style={labelStyle}>Transaction Type</label>
                                    <select
                                        style={{ ...inputStyle(!!errors.TransactionID), appearance: "none" }}
                                        {...register("TransactionID", {
                                            required: "Required",
                                            valueAsNumber: true,
                                        })}
                                    >
                                        <option value="">Select type…</option>
                                        {TRANSACTION_TYPES.map(({ label, id }) => (
                                            <option key={id} value={id}>{label}</option>
                                        ))}
                                    </select>
                                    {errors.TransactionID && (
                                        <p style={fieldErrorStyle}>{errors.TransactionID.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label style={labelStyle}>Location</label>
                                    <input
                                        type="text"
                                        style={inputStyle(!!errors.Location)}
                                        placeholder="e.g. Main Office"
                                        {...register("Location", { required: "Required" })}
                                    />
                                    {errors.Location && (
                                        <p style={fieldErrorStyle}>{errors.Location.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label style={labelStyle}>Memo</label>
                                    <input
                                        type="text"
                                        style={inputStyle(false)}
                                        placeholder="Optional note"
                                        {...register("Memo")}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Date</label>
                                    <input
                                        type="date"
                                        style={inputStyle(!!errors.Date)}
                                        {...register("Date", { required: "Required" })}
                                    />
                                    {errors.Date && (
                                        <p style={fieldErrorStyle}>{errors.Date.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Register ID, Class ID, Entry Type, Void, Rec */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr 80px 80px",
                                gap: "0.85rem",
                                marginBottom: "1.1rem",
                                alignItems: "start",
                            }}>
                                <div>
                                    <label style={labelStyle}>Register ID</label>
                                    <input
                                        type="text"
                                        style={inputStyle(!!errors.RegisterID)}
                                        placeholder="e.g. REG-01"
                                        {...register("RegisterID", { required: "Required" })}
                                    />
                                    {errors.RegisterID && (
                                        <p style={fieldErrorStyle}>{errors.RegisterID.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label style={labelStyle}>Class ID</label>
                                    <input
                                        type="text"
                                        style={inputStyle(!!errors.ClassID)}
                                        placeholder="e.g. CLS-01"
                                        {...register("ClassID", { required: "Required" })}
                                    />
                                    {errors.ClassID && (
                                        <p style={fieldErrorStyle}>{errors.ClassID.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label style={labelStyle}>Entry Type</label>
                                    <select
                                        style={{ ...inputStyle(!!errors.EntryType), appearance: "none" }}
                                        {...register("EntryType", { required: "Required" })}
                                    >
                                        <option value="">Select…</option>
                                        <option value="single">Single</option>
                                        <option value="group">Group</option>
                                    </select>
                                    {errors.EntryType && (
                                        <p style={fieldErrorStyle}>{errors.EntryType.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label style={labelStyle}>Void</label>
                                    <div style={{ display: "flex", alignItems: "center", height: "30px" }}>
                                        <input
                                            type="checkbox"
                                            id="void-check"
                                            style={{ accentColor: sg.brandHover, width: "16px", height: "16px", cursor: "pointer" }}
                                            {...register("Void")}
                                        />
                                        <label
                                            htmlFor="void-check"
                                            style={{ marginLeft: "0.4rem", fontSize: "0.8rem", color: sg.textSecondary, fontFamily: sg.font, cursor: "pointer" }}
                                        >
                                            Yes
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label style={labelStyle}>Reconciled</label>
                                    <div style={{ display: "flex", alignItems: "center", height: "30px" }}>
                                        <input
                                            type="checkbox"
                                            id="rec-check"
                                            style={{ accentColor: sg.brandHover, width: "16px", height: "16px", cursor: "pointer" }}
                                            {...register("Rec")}
                                        />
                                        <label
                                            htmlFor="rec-check"
                                            style={{ marginLeft: "0.4rem", fontSize: "0.8rem", color: sg.textSecondary, fontFamily: sg.font, cursor: "pointer" }}
                                        >
                                            Yes
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end" }}>
                                <button
                                    type="button"
                                    onClick={handleCancelForm}
                                    style={{
                                        padding: "0.45rem 1rem",
                                        backgroundColor: "transparent",
                                        color: sg.textSecondary,
                                        border: `1px solid ${sg.border}`,
                                        borderRadius: "5px",
                                        fontFamily: sg.font,
                                        fontSize: "0.78rem",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        padding: "0.45rem 1.1rem",
                                        backgroundColor: isSubmitting ? sg.disabledBtn : sg.brand,
                                        color: isSubmitting ? sg.disabled : sg.textPrimary,
                                        border: "none",
                                        borderRadius: "5px",
                                        fontFamily: sg.font,
                                        fontSize: "0.78rem",
                                        fontWeight: 600,
                                        cursor: isSubmitting ? "not-allowed" : "pointer",
                                        transition: "background-color 0.15s ease",
                                    }}
                                >
                                    {isSubmitting ? "Saving…" : "Save Entry"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

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

                {filteredEntries.length === 0 && (
                    <div style={{ padding: "2rem", textAlign: "center", color: sg.disabled, fontFamily: sg.font }}>
                        {selectedRegisterID ? "No entries found for this register." : "No entries found."}
                    </div>
                )}

                {filteredEntries.map((entry, index) => {
                    const entryFunds = getFundsForEntry(entry.ID);
                    const isExpanded = expandedEntries.has(entry.ID);
                    const hasFunds = entryFunds.length > 0;
                    const { deposit, payment } = getDepositPayment(entry);
                    const currentTransaction = transactions.find(t => Number(t.ID) === Number(entry.TransactionID));
                    const isEven = index % 2 === 0;
                    const rowBg = isExpanded ? sg.highlight : isEven ? sg.bgPanel : sg.bgPage;

                    return (
                        <div key={entry.ID} style={{ borderBottom: `1px solid ${sg.border}` }}>
                            <div
                                onClick={() => toggleExpanded(entry.ID)}
                                data-expanded={isExpanded ? "true" : "false"}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = sg.hoverBg; }}
                                onMouseLeave={e => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.backgroundColor = el.dataset.expanded === "true"
                                        ? sg.highlight
                                        : isEven ? sg.bgPanel : sg.bgPage;
                                }}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: entryColumns,
                                    padding: "0.75rem 1rem",
                                    backgroundColor: rowBg,
                                    cursor: "pointer",
                                    fontSize: "0.875rem",
                                    color: sg.textPrimary,
                                    fontFamily: sg.font,
                                    fontWeight: 400,
                                    alignItems: "center",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{
                                        fontSize: "0.6rem",
                                        color: hasFunds ? sg.textMuted : sg.disabledBtn,
                                        display: "inline-block",
                                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                        transition: "transform 0.15s ease",
                                        userSelect: "none",
                                    }}>
                                        ▶
                                    </span>
                                </div>
                                <div style={cellStyle}>{currentTransaction?.TransactionName}</div>
                                <div style={cellStyle}>{entry.Location}</div>
                                <div style={cellStyle}>{entry.Memo}</div>
                                <div style={cellStyle}>{formatDate(entry.Date)}</div>
                                <div style={cellStyle}>{entry.RegisterID}</div>
                                <div style={cellStyle}>{entry.Void ? "Yes" : "No"}</div>
                                <div style={cellStyle}>{entry.Rec ? "Yes" : "No"}</div>
                                <div style={{ ...cellStyle, color: deposit !== null ? sg.success : sg.textPrimary, fontWeight: deposit !== null ? 600 : 400 }}>
                                    {deposit !== null ? formatCurrency(deposit) : ""}
                                </div>
                                <div style={{ ...cellStyle, color: payment !== null ? sg.error : sg.textPrimary, fontWeight: payment !== null ? 600 : 400 }}>
                                    {payment !== null ? formatCurrency(payment) : ""}
                                </div>
                                <div style={cellStyle}>{entry.EntryType}</div>
                            </div>

                            {isExpanded && (
                                <div style={{
                                    backgroundColor: sg.highlight,
                                    borderTop: `1px solid ${sg.secondary}`,
                                    borderLeft: `4px solid ${sg.brand}`,
                                    marginLeft: "1rem",
                                }}>
                                    {!hasFunds ? (
                                        <div style={{ padding: "1rem 1.25rem", fontSize: "0.8rem", color: sg.textMuted, fontFamily: sg.font, fontStyle: "italic" }}>
                                            No funds linked to this entry.
                                        </div>
                                    ) : (
                                        <>
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
                                            </div>
                                            {entryFunds.map((fund, fi) => (
                                                <div
                                                    key={fund.ID}
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns: fundColumns,
                                                        padding: "0.6rem 1rem",
                                                        fontSize: "0.85rem",
                                                        color: sg.textPrimary,
                                                        backgroundColor: fi % 2 === 0 ? sg.highlight : sg.bgPanel,
                                                        borderBottom: fi < entryFunds.length - 1 ? `1px solid ${sg.secondary}` : "none",
                                                        fontFamily: sg.font,
                                                        fontWeight: 400,
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <div style={{ ...cellStyle, fontWeight: 600, color: sg.brandHover }}>#{fund.ID}</div>
                                                    <div style={cellStyle}>{fund.AccountID}</div>
                                                    <div style={cellStyle}>{fund.Target}</div>
                                                    <div style={cellStyle}>{fund.Description}</div>
                                                    <div style={cellStyle}>{fund.PaymentMethod}</div>
                                                    <div style={{ ...cellStyle, fontWeight: 600, color: fund.Amount > 0 ? sg.success : sg.error }}>
                                                        {formatCurrency(fund.Amount)}
                                                    </div>
                                                </div>
                                            ))}
                                            <div style={{ padding: "0.4rem 1rem", fontSize: "0.75rem", color: sg.textMuted, fontFamily: sg.font }}>
                                                {entryFunds.length} fund{entryFunds.length !== 1 ? "s" : ""} linked to this entry
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}