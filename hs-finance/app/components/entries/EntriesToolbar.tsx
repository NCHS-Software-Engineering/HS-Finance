import type { Register } from "@/types";
import { sg } from "./constants";

type EntriesToolbarProps = {
    registers: Register[];
    selectedRegisterID: string;
    onSelectRegister: (registerID: string) => void;
    showForm: boolean;
    onToggleForm: () => void;
    reconciliationMode: boolean;
    isSavingReconciliation: boolean;
    onToggleReconciliationMode: () => void;
};

export default function EntriesToolbar({
    registers,
    selectedRegisterID,
    onSelectRegister,
    showForm,
    onToggleForm,
    reconciliationMode,
    isSavingReconciliation,
    onToggleReconciliationMode,
}: EntriesToolbarProps) {
    const canAddEntry = selectedRegisterID !== "all";

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.65rem 1rem",
            borderBottom: `1px solid ${sg.border}`,
            backgroundColor: sg.bgPanel,
            gap: "1rem",
        }}>
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
                    onChange={e => onSelectRegister(e.target.value)}
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
                    <option 
                        value="all" 
                        style={{ 
                            fontWeight: 'bold', 
                            backgroundColor: '#f0f0f0', // Light grey background
                            color: '#007bff'           // Distinct blue text
                        }}
                    >All Entries</option>
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

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                    onClick={onToggleReconciliationMode}
                    disabled={isSavingReconciliation}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.45rem 0.9rem",
                        backgroundColor: reconciliationMode ? sg.successBg : "transparent",
                        color: reconciliationMode ? sg.success : sg.textSecondary,
                        border: `1px solid ${reconciliationMode ? sg.success : sg.border}`,
                        borderRadius: "5px",
                        fontFamily: sg.font,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        opacity: isSavingReconciliation ? 0.65 : 1,
                        cursor: isSavingReconciliation ? "not-allowed" : "pointer",
                    }}
                >
                    {isSavingReconciliation && (
                        <svg width="12" height="12" viewBox="0 0 50 50" aria-hidden="true">
                            <circle
                                cx="25"
                                cy="25"
                                r="20"
                                fill="none"
                                stroke="rgba(22,101,52,0.25)"
                                strokeWidth="6"
                            />
                            <path
                                d="M25 5a20 20 0 0 1 20 20"
                                fill="none"
                                stroke={sg.success}
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
                    {isSavingReconciliation
                        ? "Saving Reconciliation..."
                        : (reconciliationMode ? "Save + Exit Reconciliation" : "Enter Reconciliation Mode")}
                </button>

                {canAddEntry && (
                    <button
                        onClick={onToggleForm}
                        disabled={reconciliationMode || isSavingReconciliation}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            padding: "0.45rem 0.9rem",
                            backgroundColor: (reconciliationMode || isSavingReconciliation) ? sg.disabledBtn : (showForm ? sg.secondary : sg.brand),
                            color: (reconciliationMode || isSavingReconciliation) ? sg.disabled : sg.textPrimary,
                            border: "none",
                            borderRadius: "5px",
                            fontFamily: sg.font,
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: (reconciliationMode || isSavingReconciliation) ? "not-allowed" : "pointer",
                            transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={e => {
                            if (!reconciliationMode && !isSavingReconciliation) e.currentTarget.style.backgroundColor = sg.brandHover;
                        }}
                        onMouseLeave={e => {
                            if (!reconciliationMode && !isSavingReconciliation) e.currentTarget.style.backgroundColor = showForm ? sg.secondary : sg.brand;
                        }}
                    >
                        <span style={{ fontSize: "1rem", lineHeight: 1 }}>{showForm ? "✕" : "+"}</span>
                        {showForm ? "Cancel" : "Add Entry"}
                    </button>
                )}
            </div>
        </div>
    );
}
