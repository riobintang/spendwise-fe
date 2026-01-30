import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import TransactionForm from "@/components/TransactionForm";
import TransactionTable from "@/components/TransactionTable";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import {
  IncomeExpenseChart,
  CategoryChart,
  ExpenseBreakdownChart,
} from "@/components/ChartPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Transaction,
  TransactionsResponse,
  Category,
  Wallet,
  TransactionType,
  SummaryResponse,
} from "@shared/api";
import { colorToHex } from "@shared/colors";
import {
  formatCurrency,
  formatMonth,
  getMonthYearKey,
} from "@/utils/formatters";
import { Plus, TrendingUp, TrendingDown, Wallet as WalletIcon, X } from "lucide-react";
import { ResponseBody } from "@/utils/responseBody";
import { withAuth } from "@/components/withAuth";

function Index() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Partial<Transaction> | null>(null);
  const [chartStartDate, setChartStartDate] = useState("");
  const [chartEndDate, setChartEndDate] = useState("");

  // Fetch categories
  const { data: categoriesData } = useQuery<ResponseBody<Category[]>>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetchWithAuth("/categories");
      return res.json();
    },
  });

  // Fetch wallets
  const { data: walletsData } = useQuery<ResponseBody<Wallet[]>>({
    queryKey: ["wallets"],
    queryFn: async () => {
      const res = await fetchWithAuth("/wallets");
      return res.json();
    },
  });

  // Fetch transactions
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery<
    ResponseBody<TransactionsResponse>
  >({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetchWithAuth("/transactions");
      return res.json();
    },
  });

  // Build summary URL with date filters
  const buildSummaryUrl = () => {
    const params = new URLSearchParams();
    if (chartStartDate && chartStartDate.trim()) {
      params.append("startDate", chartStartDate.trim());
    }
    if (chartEndDate && chartEndDate.trim()) {
      params.append("endDate", chartEndDate.trim());
    }
    const queryString = params.toString();
    return queryString ? `/summary?${queryString}` : "/summary";
  };

  // Fetch summary with optional date filters
  const { data: summaryData } = useQuery<ResponseBody<SummaryResponse>>({
    queryKey: ["summary", chartStartDate, chartEndDate],
    queryFn: async () => {
      const url = buildSummaryUrl();
      const res = await fetchWithAuth(url);
      return res.json();
    },
  });

  // Add/Update transaction
  const { mutate: saveTransaction, isPending: isSaving } = useMutation({
    mutationFn: async (transaction: Partial<Transaction>) => {
      const method = editingTransaction?.id ? "PUT" : "POST";
      const url = editingTransaction?.id
        ? `/transactions/${editingTransaction.id}`
        : "/transactions";

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });

      if (!res.ok) throw new Error("Failed to save transaction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      setEditingTransaction(null);
      setFormOpen(false);
    },
  });

  // Delete transaction
  const { mutate: deleteTransaction } = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete transaction");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });

  const categories = categoriesData?.data || [];
  const wallets = walletsData?.data || [];
  const transactions = transactionsData?.data?.transactions || [];
  const summary = transactionsData?.data?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    byCategory: {},
  };

  // Prepare chart data with category colors
  const categoryChartData = Object.entries(summary.byCategory)
    .filter(([, value]) => value !== 0)
    .map(([categoryId, value]) => {
      const category = categories.find((c) => c.id === Number(categoryId));
      return {
        id: categoryId,
        name: category?.name || "Unknown",
        value: Math.abs(value),
        fill: category?.color || "#8b5cf6",
        color: category?.color || "#8b5cf6",
      };
    });

  const monthlyData = summaryData?.data?.monthly || [];

  const handleAddExpense = () => {
    setEditingTransaction(null);
    setFormOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleSaveTransaction = async (transaction: Partial<Transaction>) => {
    saveTransaction(transaction);
  };

  const handleClearChartFilters = () => {
    setChartStartDate("");
    setChartEndDate("");
  };

  const hasChartFilters = chartStartDate || chartEndDate;

  return (
    <Layout>
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Track your income and expenses
            </p>
          </div>
          <Button
            onClick={handleAddExpense}
            size="lg"
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-success to-green-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(summary.totalIncome)}
              </div>
              <p className="text-green-100 text-sm mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-destructive to-red-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(summary.totalExpense)}
              </div>
              <p className="text-red-100 text-sm mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <WalletIcon className="w-4 h-4" />
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(summary.balance)}
              </div>
              <p className="text-purple-100 text-sm mt-1">
                {summary.balance >= 0 ? "Positive" : "Negative"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Chart Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Start Date
                </label>
                <input
                  type="date"
                  value={chartStartDate}
                  onChange={(e) => setChartStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  End Date
                </label>
                <input
                  type="date"
                  value={chartEndDate}
                  onChange={(e) => setChartEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>

              {hasChartFilters && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={handleClearChartFilters}
                    className="w-full gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="space-y-6">
          {/* Income vs Expenses */}
          {monthlyData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IncomeExpenseChart data={monthlyData} />
            </div>
          )}

          {/* Spending by Category - Full Width */}
          {categoryChartData.length > 0 && (
            <CategoryChart data={categoryChartData} />
          )}
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable
              transactions={transactions.slice(0, 10)}
              categories={categories}
              wallets={wallets}
              onEdit={handleEditTransaction}
              onDelete={(id) => deleteTransaction(id)}
              isLoading={isLoadingTransactions}
            />
          </CardContent>
        </Card>
      </div>

      {/* Transaction Form Dialog */}
      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSaveTransaction}
        categories={categories}
        wallets={wallets}
        initialData={editingTransaction || undefined}
      />
    </Layout>
  );
}

export default withAuth(Index);
