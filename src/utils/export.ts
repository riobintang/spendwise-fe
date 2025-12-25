import { Transaction, Category, Wallet } from "@shared/api";
import * as XLSX from "xlsx";
import { exportTransactions } from "@/services/api";

/**
 * Export transactions to Excel format (.xlsx)
 * Calls the API to get export data, then generates Excel file
 */
export async function exportToExcel(
  _transactions: Transaction[],
  _categories: Category[],
  _wallets: Wallet[],
  _summaryData?: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  },
  startDate?: string,
  endDate?: string
): Promise<void> {
  try {
    // Call mock API to get export data
    const response = await exportTransactions("excel", startDate, endDate);

    // Parse the response data
    const exportData = JSON.parse(response.data as string);
    const filteredTransactions = exportData.transactions;
    const categories = exportData.categories;
    const wallets = exportData.wallets;

    // Prepare data rows
    const dataRows = filteredTransactions.map((t: Transaction) => {
      const category = categories.find((c: Category) => c.id === t.categoryId);
      const wallet = wallets.find((w: Wallet) => w.id === t.walletId);

      return [
        t.date,
        t.description,
        category?.name || "Unknown",
        wallet?.name || "Unknown",
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        t.amount,
      ];
    });

    // Create worksheet data with headers and transactions
    const headers = [
      "Date",
      "Description",
      "Category",
      "Wallet",
      "Type",
      "Amount",
    ];
    const worksheetData = [headers, ...dataRows];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Format headers (bold)
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "D3D3D3" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    // Apply header styling
    for (let i = 0; i < headers.length; i++) {
      const cellAddress = XLSX.utils.encode_col(i) + "1";
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = headerStyle;
    }

    // Auto-size columns
    const colWidths = [12, 30, 15, 15, 12, 12];
    worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Write file
    XLSX.writeFile(workbook, response.filename);
  } catch (error) {
    console.error("Excel export failed:", error);
    throw new Error(
      `Failed to export to Excel: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Export transactions to CSV format
 * Calls the API to get export data, then downloads as CSV
 */
export function exportToCSV(
  _transactions: Transaction[],
  _categories: Category[],
  _wallets: Wallet[],
  startDate?: string,
  endDate?: string
): void {
  exportTransactions("csv", startDate, endDate)
    .then((response) => {
      downloadFile(response.data as string, response.filename, response.mimeType);
    })
    .catch((error) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to export to CSV: ${errorMessage}`);
    });
}

/**
 * Export transactions to JSON format
 * Calls the API to get export data, then downloads as JSON
 */
export function exportToJSON(
  _transactions: Transaction[],
  startDate?: string,
  endDate?: string
): void {
  exportTransactions("json", startDate, endDate)
    .then((response) => {
      downloadFile(response.data as string, response.filename, response.mimeType);
    })
    .catch((error) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to export to JSON: ${errorMessage}`);
    });
}

/**
 * Helper function to trigger file download
 */
function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
