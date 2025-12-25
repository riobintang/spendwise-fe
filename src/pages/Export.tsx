import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Transaction,
  TransactionsResponse,
  Category,
  Wallet,
} from "@shared/api";
import {
  exportToExcel,
  exportToCSV,
  exportToJSON,
} from "@/utils/export";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, AlertCircle } from "lucide-react";

export default function Export() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch all transactions
  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useQuery<TransactionsResponse>({
      queryKey: ["transactions"],
      queryFn: async () => {
        const res = await fetchWithAuth("/api/transactions");
        if (!res.ok) throw new Error("Failed to fetch transactions");
        return res.json();
      },
    });

  // Fetch categories
  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Fetch wallets
  const { data: walletsData } = useQuery<Wallet[]>({
    queryKey: ["wallets"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/wallets");
      if (!res.ok) throw new Error("Failed to fetch wallets");
      return res.json();
    },
  });

  const transactions = transactionsData?.transactions || [];
  const categories = categoriesData || [];
  const wallets = walletsData || [];

  // Filter transactions by date range
  const getFilteredTransactions = (): Transaction[] => {
    return transactions.filter((t) => {
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const handleExportExcel = async () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: "No data available",
        description: "No transactions found for the selected date range.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);
      await exportToExcel(
        transactions,
        categories,
        wallets,
        undefined,
        startDate || undefined,
        endDate || undefined
      );
      toast({
        title: "Success",
        description: "Transactions exported to Excel successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description:
          error instanceof Error ? error.message : "Failed to export to Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: "No data available",
        description: "No transactions found for the selected date range.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);
      exportToCSV(
        transactions,
        categories,
        wallets,
        startDate || undefined,
        endDate || undefined
      );
      toast({
        title: "Success",
        description: "Transactions exported to CSV successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description:
          error instanceof Error ? error.message : "Failed to export to CSV",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: "No data available",
        description: "No transactions found for the selected date range.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);
      exportToJSON(
        transactions,
        startDate || undefined,
        endDate || undefined
      );
      toast({
        title: "Success",
        description: "Transactions exported to JSON successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description:
          error instanceof Error ? error.message : "Failed to export to JSON",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const hasFilters = startDate || endDate;

  if (isLoadingTransactions) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Export Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Export your transactions in multiple formats with date range filtering
          </p>
        </div>

        {/* Date Range Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Date Range Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>

              {hasFilters && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            {filteredTransactions.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">
                  {filteredTransactions.length} transaction(s) will be exported
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Format
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 && transactions.length > 0 ? (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-md flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">No data available</p>
                  <p className="text-sm text-destructive/80 mt-1">
                    No transactions found for the selected date range. Please adjust your filters or choose to export all transactions.
                  </p>
                </div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  No transactions available to export.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleExportExcel}
                  disabled={isExporting || filteredTransactions.length === 0}
                  className="w-full h-auto flex-col gap-2 py-4"
                >
                  <FileText className="w-6 h-6" />
                  <span>Export to Excel</span>
                  <span className="text-xs font-normal opacity-75">
                    .xlsx format
                  </span>
                </Button>

                <Button
                  onClick={handleExportCSV}
                  disabled={isExporting || filteredTransactions.length === 0}
                  variant="outline"
                  className="w-full h-auto flex-col gap-2 py-4"
                >
                  <FileText className="w-6 h-6" />
                  <span>Export to CSV</span>
                  <span className="text-xs font-normal opacity-75">
                    .csv format
                  </span>
                </Button>

                <Button
                  onClick={handleExportJSON}
                  disabled={isExporting || filteredTransactions.length === 0}
                  variant="outline"
                  className="w-full h-auto flex-col gap-2 py-4"
                >
                  <FileText className="w-6 h-6" />
                  <span>Export to JSON</span>
                  <span className="text-xs font-normal opacity-75">
                    .json format
                  </span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              Export Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>
              <strong>Start Date Only:</strong> Exports transactions from the selected date to the present
            </p>
            <p>
              <strong>End Date Only:</strong> Exports transactions from the beginning up to the selected date
            </p>
            <p>
              <strong>Both Dates:</strong> Exports transactions within the date range (inclusive)
            </p>
            <p>
              <strong>No Date Selected:</strong> Exports all transactions
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
