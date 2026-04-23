import type { CSSProperties } from "react";
import type { Fund } from "@/types";
import { sg } from "./constants";

type FundsEditPanelProps = {
    funds: Fund[];
    onFundsChange: (funds: Fund[]) => void;
    formatCurrency: (amount: number) => string;
};

export default function FundsEditPanel({ funds, onFundsChange, formatCurrency }: FundsEditPanelProps) {
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

    const handleAddFund = () => {
        const newFund: Fund = {
            ID: 0,
            EntryID: 0,
            AccountID: 0,
            Target: "",
            Description: "",
            PaymentMethod: "",
            ReferenceNumber: 0,
            Amount: 0,
            Class: "",
        };
        onFundsChange([...funds, newFund]);
    };

    const handleRemoveFund = (index: number) => {
        onFundsChange(funds.filter((_, i) => i !== index));
    };

    const handleFundChange = (index: number, field: keyof Fund, value: any) => {
        const updated = [...funds];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };
        onFundsChange(updated);
    };

    return (
        <div style={{
            backgroundColor: sg.bgPanel,
            border: `1px solid ${sg.border}`,
            borderRadius: "4px",
            padding: "1rem",
            marginBottom: "1rem",
        }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
            }}>
                <p style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: sg.brandHover,
                    fontFamily: sg.font,
                }}>
                    Funds ({funds.length})
                </p>
                <button
                    type="button"
                    onClick={handleAddFund}
                    style={{
                        padding: "0.3rem 0.8rem",
                        backgroundColor: sg.brand,
                        color: sg.textPrimary,
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: sg.font,
                    }}
                >
                    + Add Fund
                </button>
            </div>

            {funds.length === 0 ? (
                <div style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: sg.textMuted,
                    fontSize: "0.8rem",
                    fontFamily: sg.font,
                    fontStyle: "italic",
                }}>
                    No funds. Click "Add Fund" to create one.
                </div>
            ) : (
                funds.map((fund, index) => (
                    <div key={index} style={{
                        backgroundColor: sg.highlight,
                        border: `1px solid ${sg.border}`,
                        borderRadius: "4px",
                        padding: "0.8rem",
                        marginBottom: index < funds.length - 1 ? "0.8rem" : 0,
                    }}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr auto",
                            gap: "0.6rem",
                            alignItems: "end",
                        }}>
                            <div>
                                <label style={labelStyle}>Target</label>
                                <input
                                    type="text"
                                    style={inputStyle(false)}
                                    value={fund.Target}
                                    onChange={e => handleFundChange(index, "Target", e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Description</label>
                                <input
                                    type="text"
                                    style={inputStyle(false)}
                                    value={fund.Description}
                                    onChange={e => handleFundChange(index, "Description", e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Payment Method</label>
                                <input
                                    type="text"
                                    style={inputStyle(false)}
                                    value={fund.PaymentMethod}
                                    onChange={e => handleFundChange(index, "PaymentMethod", e.target.value)}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveFund(index)}
                                style={{
                                    padding: "0.4rem 0.6rem",
                                    backgroundColor: sg.error,
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    fontFamily: sg.font,
                                    height: "30px",
                                }}
                            >
                                Remove
                            </button>
                        </div>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "0.6rem",
                            marginTop: "0.6rem",
                        }}>
                            <div>
                                <label style={labelStyle}>Reference Number</label>
                                <input
                                    type="number"
                                    style={inputStyle(false)}
                                    value={fund.ReferenceNumber}
                                    onChange={e => handleFundChange(index, "ReferenceNumber", parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    style={inputStyle(false)}
                                    value={fund.Amount}
                                    onChange={e => handleFundChange(index, "Amount", parseFloat(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
