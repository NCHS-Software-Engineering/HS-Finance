export const sg = {
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
} as const;

export const TRANSACTION_TYPES = [
    { label: "Deposit", id: 1 },
    { label: "Expenditure", id: 2 },
    { label: "Transfer", id: 3 },
    { label: "Payment", id: 4 },
    { label: "Check (Deposit)", id: 5 },
    { label: "Check (Payment)", id: 6 },
    { label: "Transfer Out", id: 7 },
] as const;

export const ENTRY_COLUMNS = "32px 1fr 1.2fr 1.5fr 110px 70px 70px 90px 100px 100px 80px";
export const FUND_COLUMNS = "90px 100px 1fr 1.2fr 110px 100px";
