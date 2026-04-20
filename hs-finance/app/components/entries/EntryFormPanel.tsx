import type { CSSProperties } from "react";
import type { FieldErrors, UseFormHandleSubmit, UseFormRegister } from "react-hook-form";
import type { Account, Class, Register } from "@/types";
import { sg, TRANSACTION_TYPES } from "./constants";
import type { EntryFormData } from "./types";

type EntryFormPanelProps = {
    selectedRegister?: Register;
    accounts: Account[];
    classes: Class[];
    errors: FieldErrors<EntryFormData>;
    register: UseFormRegister<EntryFormData>;
    handleSubmit: UseFormHandleSubmit<EntryFormData, EntryFormData>;
    onSubmit: (data: EntryFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    submitError: string | null;
    submitSuccess: boolean;
};

export default function EntryFormPanel({
    selectedRegister,
    accounts,
    classes,
    errors,
    register,
    handleSubmit,
    onSubmit,
    onCancel,
    isSubmitting,
    submitError,
    submitSuccess,
}: EntryFormPanelProps) {
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
                New Entry
                {selectedRegister && (
                    <span style={{ fontWeight: 400, color: sg.textMuted, marginLeft: "0.6rem", textTransform: "none", letterSpacing: 0 }}>
                        {"-> "}{selectedRegister.RegisterName}
                    </span>
                )}
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
                            {...register("TransactionID", {
                                required: "Required",
                                valueAsNumber: true,
                            })}
                        >
                            <option value="">Select type...</option>
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
                        <label style={labelStyle}>Account</label>
                        <select
                            style={{ ...inputStyle(!!errors.AccountID), appearance: "none" }}
                            {...register("AccountID", {
                                required: "Required",
                                valueAsNumber: true,
                            })}
                        >
                            <option value="">Select account...</option>
                            {accounts.map(a => (
                                <option key={a.ID} value={a.ID}>{a.AccountName}</option>
                            ))}
                        </select>
                        {errors.AccountID && (
                            <p style={fieldErrorStyle}>{errors.AccountID.message}</p>
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
                            {...register("ClassID", {
                                required: "Required",
                                valueAsNumber: true,
                            })}
                        >
                            <option value="">Select class...</option>
                            {classes.map(c => (
                                <option key={c.ID} value={c.ID}>{c.ClassName}</option>
                            ))}
                        </select>
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
                            <option value="">Select...</option>
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
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            height: "30px",
                            fontSize: "0.75rem",
                            color: sg.textMuted,
                            fontFamily: sg.font,
                            fontStyle: "italic",
                        }}>
                            null (future mode)
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        onClick={onCancel}
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
                        {isSubmitting ? "Saving..." : "Save Entry"}
                    </button>
                </div>
            </form>
        </div>
    );
}
