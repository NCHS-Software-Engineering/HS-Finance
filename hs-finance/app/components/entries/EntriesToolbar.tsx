import type { Register } from "@/types";
import { sg } from "./constants";

type EntriesToolbarProps = {
    registers: Register[];
    selectedRegisterID: string;
    onSelectRegister: (registerID: string) => void;
    showForm: boolean;
    onToggleForm: () => void;
};

export default function EntriesToolbar({
    registers,
    selectedRegisterID,
    onSelectRegister,
    showForm,
    onToggleForm,
}: EntriesToolbarProps) {
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

            <button
                onClick={onToggleForm}
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
    );
}
