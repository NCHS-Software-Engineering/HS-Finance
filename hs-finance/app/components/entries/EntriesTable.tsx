import type { CSSProperties } from "react";
import type { Entry, Fund, Transaction } from "@/types";
import { ENTRY_COLUMNS, FUND_COLUMNS, sg } from "./constants";

type DepositPayment = {
    deposit: number | null;
    payment: number | null;
};

type EntriesTableProps = {
    entries: Entry[];
    expandedEntries: Set<number>;
    onToggleExpanded: (entryID: number) => void;
    transactions: Transaction[];
    getFundsForEntry: (entryID: number) => Fund[];
    getDepositPayment: (entry: Entry) => DepositPayment;
    formatDate: (date: Date | string) => string;
    formatCurrency: (amount: number) => string;
    selectedRegisterID: string;
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
    getFundsForEntry,
    getDepositPayment,
    formatDate,
    formatCurrency,
    selectedRegisterID,
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
            </div>

            {entries.length === 0 && (
                <div style={{ padding: "2rem", textAlign: "center", color: sg.disabled, fontFamily: sg.font }}>
                    {selectedRegisterID ? "No entries found for this register." : "No entries found."}
                </div>
            )}

            {entries.map((entry, index) => {
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
                                            gridTemplateColumns: FUND_COLUMNS,
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
                                                    gridTemplateColumns: FUND_COLUMNS,
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
        </>
    );
}
