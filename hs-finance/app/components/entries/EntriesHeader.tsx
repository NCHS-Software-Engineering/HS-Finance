import { sg } from "./constants";

type EntriesHeaderProps = {
    entryCount: number;
    selectedRegisterName?: string;
    netTotal: number;
    reconciliationMode: boolean;
    reconciliationTotal: number;
    formatCurrency: (amount: number) => string;
};

export default function EntriesHeader({
    entryCount,
    selectedRegisterName,
    netTotal,
    reconciliationMode,
    reconciliationTotal,
    formatCurrency,
}: EntriesHeaderProps) {
    const summaryValue = reconciliationMode ? reconciliationTotal : netTotal;
    const summaryLabel = reconciliationMode ? "Reconciliation Total" : "Net Total";
    const summaryTrend = reconciliationMode
        ? "Starts at 0 and increases as entries are reconciled"
        : (netTotal >= 0 ? "▲ surplus" : "▼ deficit");

    return (
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
                    {entryCount} {entryCount === 1 ? "entry" : "entries"}
                    {selectedRegisterName ? ` · ${selectedRegisterName}` : ""}
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem" }}>
                <span style={{
                    fontSize: "0.7rem", fontWeight: 600, color: sg.textMuted,
                    fontFamily: sg.font, textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                    {summaryLabel}
                </span>
                <span style={{
                    fontSize: "2rem", fontWeight: 700, fontFamily: sg.font,
                    color: summaryValue >= 0 ? sg.success : sg.error, lineHeight: 1,
                }}>
                    {formatCurrency(Math.abs(summaryValue))}
                </span>
                <span style={{
                    fontSize: "0.7rem", fontWeight: 400, fontFamily: sg.font,
                    color: summaryValue >= 0 ? sg.success : sg.error, opacity: 0.75,
                }}>
                    {summaryTrend}
                </span>
            </div>
        </div>
    );
}
