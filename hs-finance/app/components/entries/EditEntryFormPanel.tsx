import React, { useState } from "react";
import type { CSSProperties } from "react";
import type { Account, Class } from "@/types";
import type { Fund } from "@/types";
import { sg, TRANSACTION_TYPES } from "./constants";
import type { EntryFormData } from "./types";
import FundsEditPanel from "./FundsEditPanel";

type EditEntryFormPanelProps = {
    entryID: number;
    accounts: Account[];
    classes: Class[];
    defaultValues: EntryFormData;
    defaultFunds: Fund[];
    onSubmit: (data: EntryFormData, funds: Fund[]) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    submitError: string | null;
};

export default function EditEntryFormPanel({
    entryID,
    accounts,
    classes,
    defaultValues,
    defaultFunds,
    onSubmit,
    onCancel,
    isSubmitting,
    submitError,
}: EditEntryFormPanelProps) {
    const [formData, setFormData] = useState<EntryFormData>(defaultValues);
    const [funds, setFunds] = useState<Fund[]>(defaultFunds);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const inputStyle = (hasError: boolean): CSSProperties => ({
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

    const labelStyle: CSSProperties = {
        display: "block",
        fontSize: "0.65rem",
        fontWeight: 600,
        color: sg.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: "0.3rem",
        fontFamily: sg.font,
    };

    const fieldErrorStyle: CSSProperties = {
        fontSize: "0.65rem",
        color: sg.error,
        marginTop: "0.2rem",
        fontFamily: sg.font,
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.TransactionID) newErrors.TransactionID = "Required";
        if (!formData.Location) newErrors.Location = "Required";
        if (!formData.Date) newErrors.Date = "Required";
        if (!formData.ClassID) newErrors.ClassID = "Required";
        if (!formData.EntryType) newErrors.EntryType = "Required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData, funds);
        }
    };

    const handleFieldChange = (field: keyof EntryFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    return (
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
                Edit Entry #{entryID}
            </p>

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

            <form onSubmit={handleSubmit} noValidate>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 0.8fr 1.5fr 1fr",
                    gap: "0.85rem",
                    marginBottom: "0.85rem",
                }}>
                    <div>
                        <label style={labelStyle}>Transaction Type</label>
                        <select
                            style={{ ...inputStyle(!!errors.TransactionID), appearance: "none" }}
                            value={formData.TransactionID}
                            onChange={e => handleFieldChange("TransactionID", parseInt(e.target.value))}
                        >
                            <option value="">Select type...</option>
                            {TRANSACTION_TYPES.map(({ label, id }) => (
                                <option key={id} value={id}>{label}</option>
                            ))}
                        </select>
                        {errors.TransactionID && (
                            <p style={fieldErrorStyle}>{errors.TransactionID}</p>
                        )}
                    </div>

                    <div>
                        <label style={labelStyle}>Location</label>
                        <input
                            type="text"
                            style={inputStyle(!!errors.Location)}
                            placeholder="e.g. Main Office"
                            value={formData.Location}
                            onChange={e => handleFieldChange("Location", e.target.value)}
                        />
                        {errors.Location && (
                            <p style={fieldErrorStyle}>{errors.Location}</p>
                        )}
                    </div>

                    <div>
                        <label style={labelStyle}>Account</label>
                        <select
                            style={{ ...inputStyle(!!errors.AccountID), appearance: "none" }}
                            value={formData.AccountID}
                            onChange={e => handleFieldChange("AccountID", parseInt(e.target.value))}
                        >
                            <option value="">Select account...</option>
                            {accounts.map(a => (
                                <option key={a.ID} value={a.ID}>{a.AccountName}</option>
                            ))}
                        </select>
                        {errors.AccountID && (
                            <p style={fieldErrorStyle}>{errors.AccountID}</p>
                        )}
                    </div>

                    <div>
                        <label style={labelStyle}>Memo</label>
                        <input
                            type="text"
                            style={inputStyle(false)}
                            placeholder="Optional note"
                            value={formData.Memo}
                            onChange={e => handleFieldChange("Memo", e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Date</label>
                        <input
                            type="date"
                            style={inputStyle(!!errors.Date)}
                            value={formData.Date}
                            onChange={e => handleFieldChange("Date", e.target.value)}
                        />
                        {errors.Date && (
                            <p style={fieldErrorStyle}>{errors.Date}</p>
                        )}
                    </div>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "0.85rem",
                    marginBottom: "1.1rem",
                    alignItems: "start",
                }}>
                    <div>
                        <label style={labelStyle}>Class</label>
                        <select
                            style={{ ...inputStyle(!!errors.ClassID), appearance: "none" }}
                            value={formData.ClassID}
                            onChange={e => handleFieldChange("ClassID", parseInt(e.target.value))}
                        >
                            <option value="">Select class...</option>
                            {classes.map(c => (
                                <option key={c.ID} value={c.ID}>{c.ClassName}</option>
                            ))}
                        </select>
                        {errors.ClassID && (
                            <p style={fieldErrorStyle}>{errors.ClassID}</p>
                        )}
                    </div>

                    <div>
                        <label style={labelStyle}>Entry Type</label>
                        <select
                            style={{ ...inputStyle(!!errors.EntryType), appearance: "none" }}
                            value={formData.EntryType}
                            onChange={e => handleFieldChange("EntryType", e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="single">Single</option>
                            <option value="group">Group</option>
                        </select>
                        {errors.EntryType && (
                            <p style={fieldErrorStyle}>{errors.EntryType}</p>
                        )}
                    </div>

                    <div>
                        <label style={labelStyle}>Void</label>
                        <div style={{ display: "flex", alignItems: "center", height: "30px" }}>
                            <input
                                type="checkbox"
                                id="void-check"
                                style={{ accentColor: sg.brandHover, width: "16px", height: "16px", cursor: "pointer" }}
                                checked={formData.Void}
                                onChange={e => handleFieldChange("Void", e.target.checked)}
                            />
                            <label
                                htmlFor="void-check"
                                style={{ marginLeft: "0.4rem", fontSize: "0.8rem", color: sg.textSecondary, fontFamily: sg.font, cursor: "pointer" }}
                            >
                                Yes
                            </label>
                        </div>
                    </div>
                </div>

                <FundsEditPanel
                    funds={funds}
                    onFundsChange={setFunds}
                    formatCurrency={(amount) =>
                        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(amount))
                    }
                />

                <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        style={{
                            padding: "0.45rem 1rem",
                            backgroundColor: "transparent",
                            color: sg.textSecondary,
                            border: `1px solid ${sg.border}`,
                            borderRadius: "5px",
                            fontFamily: sg.font,
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
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
                        {isSubmitting && (
                            <svg width="12" height="12" viewBox="0 0 50 50" aria-hidden="true">
                                <circle
                                    cx="25"
                                    cy="25"
                                    r="20"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.25)"
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
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
