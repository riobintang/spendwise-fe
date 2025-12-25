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
import { exportToExcel, exportToJSON, exportToCSV } from "@/utils/export";
import { Download, FileJson, FileText } from "lucide-react";

export default function Settings() {
  const [isExporting, setIsExporting] = useState(false);

  // Fetch transactions
  const { data: transactionsData } = useQuery<TransactionsResponse>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/transactions");
      return res.json();
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/categories");
      return res.json();
    },
  });

  // Fetch wallets
  const { data: walletsData } = useQuery<Wallet[]>({
    queryKey: ["wallets"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/wallets");
      return res.json();
    },
  });

  const transactions = transactionsData?.transactions || [];
  const summary = transactionsData?.summary;
  const categories = categoriesData || [];
  const wallets = walletsData || [];

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportToExcel(transactions, categories, wallets, summary);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    setIsExporting(true);
    try {
      exportToJSON(transactions);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      exportToCSV(transactions, categories, wallets);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your data and preferences
          </p>
        </div>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export your transactions in different formats
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handleExportExcel}
                disabled={isExporting || transactions.length === 0}
                className="gap-2 h-auto flex-col py-4"
                variant="outline"
              >
                <Download className="w-5 h-5" />
                <span>Export to Excel</span>
                <span className="text-xs text-muted-foreground">
                  {transactions.length} transactions
                </span>
              </Button>

              <Button
                onClick={handleExportJSON}
                disabled={isExporting || transactions.length === 0}
                className="gap-2 h-auto flex-col py-4"
                variant="outline"
              >
                <FileJson className="w-5 h-5" />
                <span>Export to JSON</span>
                <span className="text-xs text-muted-foreground">
                  {transactions.length} transactions
                </span>
              </Button>

              <Button
                onClick={handleExportCSV}
                disabled={isExporting || transactions.length === 0}
                className="gap-2 h-auto flex-col py-4"
                variant="outline"
              >
                <FileText className="w-5 h-5" />
                <span>Export to CSV</span>
                <span className="text-xs text-muted-foreground">
                  {transactions.length} transactions
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Data Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Wallets</p>
                <p className="text-2xl font-bold">{wallets.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date Range</p>
                <p className="text-sm font-bold">
                  {transactions.length > 0
                    ? `${transactions[transactions.length - 1].date} to ${transactions[0].date}`
                    : "No data"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Version:</span> 1.0.0
              </p>
              <p className="text-sm">
                <span className="font-semibold">App Name:</span> SpendWise
              </p>
              <p className="text-sm text-muted-foreground">
                Spend smarter. Live better.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
