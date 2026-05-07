import type { CSSProperties } from "react";
import type { Entry, Transaction } from "@/types";
import { ENTRY_COLUMNS, sg } from "./constants";

type DepositPayment = {
    deposit: number | null;
    payment: number | null;
};

type EntriesTableProps = {
    entries: Entry[];
    expandedEntries: Set<number>;
    onToggleExpanded: (entryID: number) => void;
    transactions: Transaction[];
    getDepositPayment: (entry: Entry) => DepositPayment;
    getEntrySignedTotal: (entry: Entry) => number;
    formatDate: (date: Date | string) => string;
    formatCurrency: (amount: number) => string;
    selectedRegisterID: string;
    reconciliationMode: boolean;
    isSavingReconciliation: boolean;
    getEntryRecValue: (entry: Entry) => boolean;
    onToggleReconciled: (entryID: number, nextRecValue: boolean) => void;
    onEdit?: (entry: Entry) => void;
    onDelete?: (entryID: number) => void;
    deletingEntryID?: number | null;
};

const cellStyle: CSSProperties = {
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

export default function EntriesTable({
    entries,
    expandedEntries,
    onToggleExpanded,
    transactions,
    getDepositPayment,
    getEntrySignedTotal,
    formatDate,
    formatCurrency,
    selectedRegisterID,
    reconciliationMode,
    isSavingReconciliation,
    getEntryRecValue,
    onToggleReconciled,
    onEdit,
    onDelete,
    deletingEntryID,
}: EntriesTableProps) {
    return (
        <>
            <div style={{
                display: "grid",
                gridTemplateColumns: ENTRY_COLUMNS,
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
                <div style={cellStyle}>Actions</div>
            </div>

            {entries.length === 0 && (
                <div style={{ padding: "2rem", textAlign: "center", color: sg.disabled, fontFamily: sg.font }}>
                    {selectedRegisterID ? "No entries found for this register." : "No entries found."}
                </div>
            )}

            {entries.map((entry, index) => {
                const isExpanded = expandedEntries.has(entry.ID);
                const { deposit, payment } = getDepositPayment(entry);
                const entrySignedTotal = getEntrySignedTotal(entry);
                const currentTransaction = transactions.find(t => Number(t.ID) === Number(entry.TransactionID));
                const isEven = index % 2 === 0;
                const rowBg = isExpanded ? sg.highlight : isEven ? sg.bgPanel : sg.bgPage;
                const recValue = getEntryRecValue(entry);
                const isDeleting = deletingEntryID === entry.ID;
                const isAnyDeleteInProgress = deletingEntryID !== null && deletingEntryID !== undefined;

                return (
                    <div key={entry.ID} style={{ borderBottom: `1px solid ${sg.border}` }}>
                        <div
                            onClick={() => onToggleExpanded(entry.ID)}
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
                                gridTemplateColumns: ENTRY_COLUMNS,
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
                                    color: sg.textMuted,
                                    display: "inline-block",
                                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                    transition: "transform 0.15s ease",
                                    userSelect: "none",
                                }}>
                                    ▶
                                </span>
                            </div>
                            <div style={cellStyle}>{currentTransaction?.TransactionName || "Unknown"}</div>
                            <div style={cellStyle}>{entry.Location}</div>
                            <div style={cellStyle}>{entry.Memo}</div>
                            <div style={cellStyle}>{formatDate(entry.Date)}</div>
                            <div style={cellStyle}>{entry.RegisterID}</div>
                            <div style={cellStyle}>{entry.Void ? "Yes" : "No"}</div>
                            <div style={cellStyle}>
                                {reconciliationMode ? (
                                    <input
                                        type="checkbox"
                                        checked={recValue}
                                        disabled={isSavingReconciliation}
                                        onClick={e => e.stopPropagation()}
                                        onChange={e => onToggleReconciled(entry.ID, e.target.checked)}
                                        title={
                                            recValue
                                                ? "Unset reconciliation for this entry"
                                                : `Mark as reconciled and add ${formatCurrency(entrySignedTotal)} to reconciliation total`
                                        }
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                            cursor: isSavingReconciliation ? "not-allowed" : "pointer",
                                            accentColor: sg.success,
                                        }}
                                    />
                                ) : null}
                            </div>
                            <div style={{ ...cellStyle, color: deposit !== null ? sg.success : sg.textPrimary, fontWeight: deposit !== null ? 600 : 400 }}>
                                {deposit !== null ? formatCurrency(deposit) : ""}
                            </div>
                            <div style={{ ...cellStyle, color: payment !== null ? sg.error : sg.textPrimary, fontWeight: payment !== null ? 600 : 400 }}>
                                {payment !== null ? formatCurrency(payment) : ""}
                            </div>
                            <div style={{ ...cellStyle, display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                                {!reconciliationMode && (
                                    <>
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                onEdit?.(entry);
                                            }}
                                            title="Edit this entry"
                                            disabled={isAnyDeleteInProgress}
                                            style={{
                                                padding: "0.25rem 0.6rem",
                                                backgroundColor: isAnyDeleteInProgress ? sg.disabledBtn : sg.brand,
                                                color: isAnyDeleteInProgress ? sg.disabled : sg.textPrimary,
                                                border: "none",
                                                borderRadius: "3px",
                                                fontSize: "0.7rem",
                                                fontWeight: 600,
                                                cursor: isAnyDeleteInProgress ? "not-allowed" : "pointer",
                                                fontFamily: sg.font,
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                if (isAnyDeleteInProgress) return;
                                                if (window.confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
                                                    onDelete?.(entry.ID);
                                                }
                                            }}
                                            title="Delete this entry"
                                            disabled={isAnyDeleteInProgress}
                                            style={{
                                                padding: "0.25rem 0.6rem",
                                                backgroundColor: isAnyDeleteInProgress ? sg.disabledBtn : sg.error,
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "3px",
                                                fontSize: "0.7rem",
                                                fontWeight: 600,
                                                cursor: isAnyDeleteInProgress ? "not-allowed" : "pointer",
                                                fontFamily: sg.font,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "0.35rem",
                                            }}
                                        >
                                            {isDeleting && (
                                                <svg width="12" height="12" viewBox="0 0 50 50" aria-hidden="true">
                                                    <circle
                                                        cx="25"
                                                        cy="25"
                                                        r="20"
                                                        fill="none"
                                                        stroke="rgba(255,255,255,0.35)"
                                                        strokeWidth="6"
                                                    />
                                                    <path
                                                        d="M25 5a20 20 0 0 1 20 20"
                                                        fill="none"
                                                        stroke="#fff"
                                                        strokeWidth="6"
                                                        strokeLinecap="round"
                                                    >
                                                        <animateTransform
                                                            attributeName="transform"
                                                            type="rotate"
                                                            from="0 25 25"
                                                            to="360 25 25"
                                                            dur="0.8s"
                                                            repeatCount="indefinite"
                                                        />
                                                    </path>
                                                </svg>
                                            )}
                                            {isDeleting ? "Deleting..." : "Delete"}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {isExpanded && (
                            <div style={{
                                backgroundColor: sg.highlight,
                                borderTop: `1px solid ${sg.secondary}`,
                                borderLeft: `4px solid ${sg.brand}`,
                                marginLeft: "1rem",
                                padding: "1rem 1.25rem",
                            }}>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "1.5rem",
                                }}>
                                    <div>
                                        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: sg.textMuted, marginBottom: "0.5rem", fontFamily: sg.font }}>Target</div>
                                        <div style={{ fontSize: "0.9rem", color: sg.textPrimary, fontFamily: sg.font }}>{entry.Target || "—"}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: sg.textMuted, marginBottom: "0.5rem", fontFamily: sg.font }}>Description</div>
                                        <div style={{ fontSize: "0.9rem", color: sg.textPrimary, fontFamily: sg.font }}>{entry.Description || "—"}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: sg.textMuted, marginBottom: "0.5rem", fontFamily: sg.font }}>Payment Method</div>
                                        <div style={{ fontSize: "0.9rem", color: sg.textPrimary, fontFamily: sg.font }}>{entry.PaymentMethod || "—"}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: sg.textMuted, marginBottom: "0.5rem", fontFamily: sg.font }}>Reference Number</div>
                                        <div style={{ fontSize: "0.9rem", color: sg.textPrimary, fontFamily: sg.font }}>{entry.ReferenceNumber || "—"}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: sg.textMuted, marginBottom: "0.5rem", fontFamily: sg.font }}>Amount</div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: entry.Amount > 0 ? sg.success : sg.error, fontFamily: sg.font }}>{formatCurrency(entry.Amount)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: sg.textMuted, marginBottom: "0.5rem", fontFamily: sg.font }}>Class</div>
                                        <div style={{ fontSize: "0.9rem", color: sg.textPrimary, fontFamily: sg.font }}>{entry.Class || "—"}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                );
            })}
        </>
    );
}
