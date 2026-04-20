"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Entry, Fund, Transaction, Register, Class, Account } from "@/types";
import { sg } from "./entries/constants";
import type { EntryFormData } from "./entries/types";
import EntriesHeader from "./entries/EntriesHeader";
import EntriesToolbar from "./entries/EntriesToolbar";
import EntryFormPanel from "./entries/EntryFormPanel";
import EntriesTable from "./entries/EntriesTable";

export default function Entries() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [funds, setFunds] = useState<Fund[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [registers, setRegisters] = useState<Register[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
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
                const [entriesRes, fundsRes, transactionsRes, registersRes, classesRes, accountsRes] = await Promise.all([
                    fetch("/api/entries"),
                    fetch("/api/funds"),
                    fetch("/api/transactions"),
                    fetch("/api/registers"),
                    fetch("/api/class"),
                    fetch("/api/chartAccounts"),
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

                const classesData = await classesRes.json();
                setClasses(Array.isArray(classesData) ? classesData : classesData.classes ?? []);

                const accountsData = await accountsRes.json();
                setAccounts(Array.isArray(accountsData) ? accountsData : accountsData.accounts ?? []);
            } catch (error) {
                console.error("Error fetching data:", error);
                setEntries([]);
                setFunds([]);
                setTransactions([]);
                setRegisters([]);
                setClasses([]);
                setAccounts([]);
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

        // Build payload that exactly matches POST schema
        const payload = {
            TransactionID: data.TransactionID,
            Location:      data.Location,
            AccountID:     data.AccountID,          // ← new field
            Memo:          data.Memo,
            Date:          data.Date,
            RegisterID:    Number(selectedRegisterID), // ← injected, not from form
            Void:          data.Void ? 1 : 0,       // ← boolean → number
            Rec:           data.Rec  ? 1 : 0,       // ← boolean → number
            EntryType:     data.EntryType,
            ClassID:       data.ClassID,             // ← already number via valueAsNumber
        };

        try {
            const res = await fetch("/api/entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
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

    const selectedRegister = registers.find(r => String(r.ID) === selectedRegisterID);

    return (
        <div style={{ backgroundColor: sg.bgPage, minHeight: "100vh", padding: "2rem", fontFamily: sg.font }}>
            <EntriesHeader
                entryCount={filteredEntries.length}
                selectedRegisterName={selectedRegister?.RegisterName}
                netTotal={netTotal}
                formatCurrency={formatCurrency}
            />

            <div style={{
                backgroundColor: sg.bgPanel,
                border: `1px solid ${sg.border}`,
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}>

                <EntriesToolbar
                    registers={registers}
                    selectedRegisterID={selectedRegisterID}
                    onSelectRegister={registerID => {
                        setSelectedRegisterID(registerID);
                        setExpandedEntries(new Set());
                    }}
                    showForm={showForm}
                    onToggleForm={() => setShowForm(v => !v)}
                />

                {showForm && (
                    <EntryFormPanel
                        selectedRegister={selectedRegister}
                        accounts={accounts}
                        classes={classes}
                        errors={errors}
                        register={register}
                        handleSubmit={handleSubmit}
                        onSubmit={onSubmit}
                        onCancel={handleCancelForm}
                        isSubmitting={isSubmitting}
                        submitError={submitError}
                        submitSuccess={submitSuccess}
                    />
                )}

                <EntriesTable
                    entries={filteredEntries}
                    expandedEntries={expandedEntries}
                    onToggleExpanded={toggleExpanded}
                    transactions={transactions}
                    getFundsForEntry={getFundsForEntry}
                    getDepositPayment={getDepositPayment}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    selectedRegisterID={selectedRegisterID}
                />
            </div>
        </div>
    );
}