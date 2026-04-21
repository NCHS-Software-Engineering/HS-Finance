"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Entry, Fund, Transaction, Register, Class, Account } from "@/types";
import { sg } from "./entries/constants";
import type { EntryFormData } from "./entries/types";
import EntriesHeader from "./entries/EntriesHeader";
import EntriesToolbar from "./entries/EntriesToolbar";
import EntryFormPanel from "./entries/EntryFormPanel";
import EditEntryFormPanel from "./entries/EditEntryFormPanel";
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
    const [reconciliationMode, setReconciliationMode] = useState(false);
    const [isSavingReconciliation, setIsSavingReconciliation] = useState(false);
    const [reconciliationOriginal, setReconciliationOriginal] = useState<Map<number, boolean>>(new Map());
    const [reconciliationDraft, setReconciliationDraft] = useState<Map<number, boolean>>(new Map());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
    const [editingFunds, setEditingFunds] = useState<Fund[]>([]);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [editSubmitError, setEditSubmitError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EntryFormData>({
        defaultValues: {
            Void: false,
        },
    });

    const refreshEntries = async () => {
        try {
            const [entriesRes, fundsRes] = await Promise.all([
                fetch("/api/entries"),
                fetch("/api/funds"),
            ]);
            const entriesData = await entriesRes.json();
            setEntries(Array.isArray(entriesData) ? entriesData : entriesData.entries ?? []);

            const fundsData = await fundsRes.json();
            setFunds(Array.isArray(fundsData) ? fundsData : fundsData.funds ?? []);

            console.log("refreshEntries completed, new entries:", entriesData, "new funds:", fundsData);
        } catch (error) {
            console.error("Error refreshing entries:", error);
        }
    };

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

        // Convert ISO date to YYYY-MM-DD format
        const dateObj = new Date(data.Date);
        const formattedDate = dateObj.toISOString().split('T')[0];

        // Build payload that exactly matches POST schema
        const payload = {
            TransactionID: data.TransactionID,
            Location:      data.Location,
            AccountID:     data.AccountID,          // ← new field
            Memo:          data.Memo,
            Date:          formattedDate,
            RegisterID:    Number(selectedRegisterID), // ← injected, not from form
            Void:          data.Void ? 1 : 0,       // ← boolean → number
            Rec:           0,                       // Reserved for future reconciliation mode
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

            await res.json();
            setSubmitSuccess(true);
            reset();

            // Refresh entries to show the new entry in the table
            await refreshEntries();

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

    const getEntrySignedTotal = (entry: Entry) => {
        const transaction = transactions.find(t => Number(t.ID) === Number(entry.TransactionID));
        const entryAmount = getFundsForEntry(entry.ID).reduce((sum, fund) => sum + Math.abs(fund.Amount), 0);
        return transaction?.MoneyIn === 1 ? entryAmount : -entryAmount;
    };

    const getCurrentRecMap = () => {
        const map = new Map<number, boolean>();
        entries.forEach(entry => {
            map.set(Number(entry.ID), !!entry.Rec);
        });
        return map;
    };

    const getEntryRecValue = (entry: Entry) => {
        if (!reconciliationMode) return !!entry.Rec;
        return reconciliationDraft.get(Number(entry.ID)) ?? !!entry.Rec;
    };

    const handleToggleReconciled = (entryID: number, nextRecValue: boolean) => {
        if (!reconciliationMode || isSavingReconciliation) return;
        setReconciliationDraft(prev => {
            const next = new Map(prev);
            next.set(Number(entryID), nextRecValue);
            return next;
        });
    };

    const handleToggleReconciliationMode = async () => {
        setSubmitError(null);

        if (!reconciliationMode) {
            const currentRecMap = getCurrentRecMap();
            setReconciliationOriginal(currentRecMap);
            setReconciliationDraft(new Map(currentRecMap));
            setShowForm(false);
            setReconciliationMode(true);
            return;
        }

        const updates: Array<{ EntryID: number; Rec: boolean }> = [];
        reconciliationDraft.forEach((draftRec, entryID) => {
            const originalRec = reconciliationOriginal.get(entryID) ?? false;
            if (draftRec !== originalRec) {
                updates.push({ EntryID: entryID, Rec: draftRec });
            }
        });

        if (updates.length === 0) {
            setReconciliationMode(false);
            setReconciliationOriginal(new Map());
            setReconciliationDraft(new Map());
            return;
        }

        setIsSavingReconciliation(true);
        try {
            const res = await fetch("/api/entries", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updates }),
            });

            if (!res.ok) throw new Error(`Server responded with ${res.status}`);

            const updatesByEntry = new Map<number, boolean>();
            updates.forEach(update => updatesByEntry.set(update.EntryID, update.Rec));
            setEntries(prev => prev.map(entry => {
                const nextRec = updatesByEntry.get(Number(entry.ID));
                return nextRec === undefined ? entry : { ...entry, Rec: nextRec };
            }));

            setReconciliationMode(false);
            setReconciliationOriginal(new Map());
            setReconciliationDraft(new Map());
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Failed to save reconciliation changes.");
        } finally {
            setIsSavingReconciliation(false);
        }
    };

    const toggleExpanded = (entryID: number) => {
        setExpandedEntries(prev => {
            const next = new Set(prev);
            if (next.has(entryID)) next.delete(entryID);
            else next.add(entryID);
            return next;
        });
    };

    const handleEditEntry = (entry: Entry) => {
        setEditingEntry(entry);
        setEditingFunds(getFundsForEntry(entry.ID));
        setShowForm(false);
        setEditSubmitError(null);
    };

    const handleEditSubmit = async (data: EntryFormData, updatedFunds: Fund[]) => {
        console.log("handleEditSubmit called with data:", data, "funds:", updatedFunds);
        if (!editingEntry) return;
        setIsEditSubmitting(true);
        setEditSubmitError(null);

        // Convert ISO date to YYYY-MM-DD format
        const dateObj = new Date(data.Date);
        const formattedDate = dateObj.toISOString().split('T')[0];

        const payload = {
            EntryID: editingEntry.ID,
            TransactionID: data.TransactionID,
            Location: data.Location,
            AccountID: data.AccountID,
            Memo: data.Memo,
            Date: formattedDate,
            Void: data.Void ? 1 : 0,
            EntryType: data.EntryType,
            ClassID: data.ClassID,
            funds: updatedFunds.map(f => ({
                Target: f.Target,
                Description: f.Description,
                PaymentMethod: f.PaymentMethod,
                ReferenceNumber: f.ReferenceNumber,
                Amount: f.Amount,
            })),
        };

        try {
            const res = await fetch("/api/entries", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            console.log("PUT response status:", res.status);
            console.log("Payload sent:", payload);

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Server error response:", errorData);
                throw new Error(`Server responded with ${res.status}: ${errorData.error || 'Unknown error'}`);
            }

            await refreshEntries();
            setEditingEntry(null);
            setEditingFunds([]);
        } catch (err) {
            console.error("Edit submission error:", err);
            setEditSubmitError(err instanceof Error ? err.message : "Failed to update entry.");
        } finally {
            setIsEditSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingEntry(null);
        setEditingFunds([]);
        setEditSubmitError(null);
    };

    const handleDeleteEntry = async (entryID: number) => {
        try {
            const res = await fetch("/api/entries", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ EntryID: entryID }),
            });

            if (!res.ok) throw new Error(`Server responded with ${res.status}`);

            await refreshEntries();
        } catch (err) {
            console.error("Error deleting entry:", err);
            alert("Failed to delete entry: " + (err instanceof Error ? err.message : "Unknown error"));
        }
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
    const reconciliationTotal = reconciliationMode
        ? filteredEntries.reduce((sum, entry) => {
            const entryID = Number(entry.ID);
            const originalRec = reconciliationOriginal.get(entryID) ?? false;
            const draftRec = reconciliationDraft.get(entryID) ?? originalRec;
            if (draftRec === originalRec) return sum;
            const signedTotal = getEntrySignedTotal(entry);
            return draftRec ? sum + signedTotal : sum - signedTotal;
        }, 0)
        : filteredEntries
            .filter(entry => !!entry.Rec)
            .reduce((sum, entry) => sum + getEntrySignedTotal(entry), 0);

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
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <EntriesHeader
                    entryCount={filteredEntries.length}
                    selectedRegisterName={selectedRegister?.RegisterName}
                    netTotal={netTotal}
                    reconciliationMode={reconciliationMode}
                    reconciliationTotal={reconciliationTotal}
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
                    onToggleForm={() => {
                        if (reconciliationMode) return;
                        setShowForm(v => !v);
                    }}
                    reconciliationMode={reconciliationMode}
                    isSavingReconciliation={isSavingReconciliation}
                    onToggleReconciliationMode={handleToggleReconciliationMode}
                />

                {showForm && !reconciliationMode && (
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

                {editingEntry && !reconciliationMode && (
                    <EditEntryFormPanel
                        entryID={editingEntry.ID}
                        accounts={accounts}
                        classes={classes}
                        defaultValues={{
                            TransactionID: editingEntry.TransactionID,
                            Location: editingEntry.Location,
                            AccountID: editingEntry.AccountID,
                            Memo: editingEntry.Memo,
                            Date: editingEntry.Date,
                            Void: !!editingEntry.Void,
                            EntryType: editingEntry.EntryType,
                            ClassID: editingEntry.ClassID || 0,
                        }}
                        defaultFunds={editingFunds}
                        onSubmit={handleEditSubmit}
                        onCancel={handleCancelEdit}
                        isSubmitting={isEditSubmitting}
                        submitError={editSubmitError}
                    />
                )}

                    <EntriesTable
                        entries={filteredEntries}
                        expandedEntries={expandedEntries}
                        onToggleExpanded={toggleExpanded}
                        transactions={transactions}
                        getFundsForEntry={getFundsForEntry}
                        getDepositPayment={getDepositPayment}
                        getEntrySignedTotal={getEntrySignedTotal}
                        formatDate={formatDate}
                        formatCurrency={formatCurrency}
                        selectedRegisterID={selectedRegisterID}
                        reconciliationMode={reconciliationMode}
                        isSavingReconciliation={isSavingReconciliation}
                        getEntryRecValue={getEntryRecValue}
                        onToggleReconciled={handleToggleReconciled}
                        onEdit={handleEditEntry}
                        onDelete={handleDeleteEntry}
                    />
                </div>
            </div>
        </div>
    );
}