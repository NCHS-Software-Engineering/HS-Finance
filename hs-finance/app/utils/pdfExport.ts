import jsPDF from "jspdf";
import type { Entry, Fund, Transaction, Register, Class, Account } from "@/types";

type ExportOptions = {
    entries: Entry[];
    funds: Fund[];
    transactions: Transaction[];
    registers: Register[];
    classes: Class[];
    accounts: Account[];
    selectedRegisterID: string;
    formatDate: (date: Date | string) => string;
    formatCurrency: (amount: number) => string;
};

type RegisterGroup = {
    register: Register;
    entries: Entry[];
    totalDebit: number;
    totalCredit: number;
};

export function exportEntriesPDF(options: ExportOptions) {
    const {
        entries,
        funds,
        transactions,
        registers,
        classes,
        accounts,
        selectedRegisterID,
        formatDate,
        formatCurrency,
    } = options;

    // Helper to get funds for an entry
    const getFundsForEntry = (entryID: number) =>
        funds.filter(f => Number(f.EntryID) === Number(entryID));

    // Helper to calculate deposit/payment amounts
    const getDepositPayment = (entry: Entry) => {
        let deposit = 0;
        let payment = 0;
        const transaction = transactions.find(t => Number(t.ID) === Number(entry.TransactionID));
        getFundsForEntry(entry.ID).forEach(fund => {
            if (transaction?.MoneyIn === 1) deposit += fund.Amount;
            else payment += Math.abs(fund.Amount);
        });
        return { deposit: deposit > 0 ? deposit : null, payment: payment > 0 ? payment : null };
    };

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let yPosition = margin;

    // Helper function to check if we need a new page
    const checkNewPage = (spaceNeeded: number) => {
        if (yPosition + spaceNeeded > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
        }
    };

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Entries Report", margin, yPosition);
    yPosition += 10;

    // Export date
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Exported: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 10;

    // Determine which registers to show
    let registerGroups: RegisterGroup[] = [];

    if (selectedRegisterID === "all") {
        // Group entries by register
        registerGroups = registers
            .map(register => {
                const registerEntries = entries.filter(e => String(e.RegisterID) === String(register.ID));
                let totalDebit = 0;
                let totalCredit = 0;

                registerEntries.forEach(entry => {
                    const transaction = transactions.find(t => t.ID === entry.TransactionID);
                    const entryFunds = getFundsForEntry(entry.ID);
                    
                    entryFunds.forEach(fund => {
                        if (transaction?.MoneyIn === 1) {
                            totalDebit += fund.Amount;
                        } else {
                            totalCredit += Math.abs(fund.Amount);
                        }
                    });
                });

                return {
                    register,
                    entries: registerEntries,
                    totalDebit,
                    totalCredit,
                };
            })
            .filter(group => group.entries.length > 0); // Only include registers with entries
    } else {
        // Single register
        const selectedRegister = registers.find(r => String(r.ID) === selectedRegisterID);
        if (selectedRegister) {
            const registerEntries = entries.filter(e => String(e.RegisterID) === selectedRegisterID);
            let totalDebit = 0;
            let totalCredit = 0;

            registerEntries.forEach(entry => {
                const transaction = transactions.find(t => t.ID === entry.TransactionID);
                const entryFunds = getFundsForEntry(entry.ID);
                
                entryFunds.forEach(fund => {
                    if (transaction?.MoneyIn === 1) {
                        totalDebit += fund.Amount;
                    } else {
                        totalCredit += Math.abs(fund.Amount);
                    }
                });
            });

            registerGroups = [
                {
                    register: selectedRegister,
                    entries: registerEntries,
                    totalDebit,
                    totalCredit,
                },
            ];
        }
    }

    // Table columns - optimized widths for better readability
    const columns = ["Date", "Memo", "Debit", "Credit", "Location"];
    const columnWidths = [16, 32, 22, 22, 48]; // Total: 140 (fits nicely with margins)

    let grandTotalDebit = 0;
    let grandTotalCredit = 0;

    // Render each register group
    registerGroups.forEach((group, groupIndex) => {
        // Register section title
        checkNewPage(15);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${group.register.RegisterName}`, margin, yPosition);
        yPosition += 8;

        // Table headers
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        
        // Draw header background
        const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
        doc.setFillColor(220, 220, 220);
        doc.rect(margin, yPosition - 5, tableWidth, 7, "F");

        // Draw header columns with proper positioning
        let xPos = margin;
        const headerY = yPosition;
        
        // Date
        doc.text("Date", xPos, headerY);
        xPos += columnWidths[0];
        
        // Memo
        doc.text("Memo", xPos, headerY);
        xPos += columnWidths[1];
        
        // Debit (right-aligned)
        doc.text("Debit", xPos + columnWidths[2] - 2, headerY, { align: "right" });
        xPos += columnWidths[2];
        
        // Credit (right-aligned)
        doc.text("Credit", xPos + columnWidths[3] - 2, headerY, { align: "right" });
        xPos += columnWidths[3];
        
        // Location
        doc.text("Location", xPos, headerY);

        yPosition += 8;

        // Table rows
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        let rowCount = 0;

        group.entries.forEach(entry => {
            checkNewPage(7);

            // Get transaction info and funds for this entry
            const transaction = transactions.find(t => t.ID === entry.TransactionID);
            const entryFunds = getFundsForEntry(entry.ID);
            
            // Calculate total debit/credit for this entry
            let entryDebit = 0;
            let entryCredit = 0;
            
            entryFunds.forEach(fund => {
                if (transaction?.MoneyIn === 1) {
                    entryDebit += fund.Amount;
                } else {
                    entryCredit += Math.abs(fund.Amount);
                }
            });

            // Alternate row background for readability
            if (rowCount % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, yPosition - 5, tableWidth, 6.5, "F");
            }

            xPos = margin;

            // Date
            doc.text(formatDate(entry.Date), xPos + 1, yPosition);
            xPos += columnWidths[0];

            // Memo (truncate if too long)
            const memoText = entry.Memo.length > 26 ? entry.Memo.substring(0, 23) + "..." : entry.Memo;
            doc.text(memoText, xPos + 1, yPosition);
            xPos += columnWidths[1];

            // Debit (right-aligned with padding)
            if (entryDebit > 0) {
                doc.text(formatCurrency(entryDebit), xPos + columnWidths[2] - 2, yPosition, { align: "right" });
            }
            xPos += columnWidths[2];

            // Credit (right-aligned with padding)
            if (entryCredit > 0) {
                doc.text(formatCurrency(entryCredit), xPos + columnWidths[3] - 2, yPosition, { align: "right" });
            }
            xPos += columnWidths[3];

            // Location (truncate if too long)
            const locationText = entry.Location.length > 38 ? entry.Location.substring(0, 35) + "..." : entry.Location;
            doc.text(locationText, xPos + 1, yPosition);

            yPosition += 6.5;
            rowCount++;
        });

        // Register summary
        checkNewPage(10);
        yPosition += 5;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(`${group.register.RegisterName} Summary`, margin, yPosition);
        yPosition += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Entries: ${group.entries.length}`, margin, yPosition);
        yPosition += 4;

        doc.setFont("helvetica", "bold");
        doc.text(`Debits: ${formatCurrency(group.totalDebit)}`, margin, yPosition);
        yPosition += 4;

        doc.text(`Credits: ${formatCurrency(group.totalCredit)}`, margin, yPosition);
        yPosition += 4;

        const balance = group.totalDebit - group.totalCredit;
        doc.setFont("helvetica", balance === 0 ? "bold" : "normal");
        doc.text(
            `Balance: ${formatCurrency(balance)} ${balance === 0 ? "✓" : ""}`,
            margin,
            yPosition
        );
        yPosition += 8;

        grandTotalDebit += group.totalDebit;
        grandTotalCredit += group.totalCredit;
    });

    // Grand summary if multiple registers
    if (registerGroups.length > 1) {
        checkNewPage(15);
        yPosition += 5;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Grand Summary - All Registers", margin, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Total Registers: ${registerGroups.length}`, margin, yPosition);
        yPosition += 5;

        doc.text(`Total Entries: ${registerGroups.reduce((sum, g) => sum + g.entries.length, 0)}`, margin, yPosition);
        yPosition += 5;

        doc.setFont("helvetica", "bold");
        doc.text(`Total Debits: ${formatCurrency(grandTotalDebit)}`, margin, yPosition);
        yPosition += 5;

        doc.text(`Total Credits: ${formatCurrency(grandTotalCredit)}`, margin, yPosition);
        yPosition += 5;

        const grandBalance = grandTotalDebit - grandTotalCredit;
        doc.setFont("helvetica", grandBalance === 0 ? "bold" : "normal");
        doc.text(
            `Grand Balance: ${formatCurrency(grandBalance)} ${grandBalance === 0 ? "✓ Balanced" : ""}`,
            margin,
            yPosition
        );
    }

    // Save the PDF
    const fileName = `entries_report_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
}
