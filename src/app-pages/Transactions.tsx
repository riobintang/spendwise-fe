import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import TransactionForm from "@/components/TransactionForm";
import TransactionTable from "@/components/TransactionTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Transaction,
  Category,
  Wallet,
  TransactionsResponse,
} from "@shared/api";
import { Plus, X } from "lucide-react";
import { ResponseBody } from "@/utils/responseBody";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { withAuth } from "@/components/withAuth";

function Transactions() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Partial<Transaction> | null>(null);

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

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

  // Fetch transactions with filters
  const { data: transactionsData, isLoading } = useQuery<ResponseBody<TransactionsResponse>>({
    queryKey: ["transactions", startDate, endDate, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (categoryFilter) params.append("categoryId", categoryFilter);
      
      const queryString = params.toString();
      const url = queryString ? `/transactions?${queryString}` : "/transactions";
      
      const res = await fetchWithAuth(url);
      return res.json();
    },
  });

  // Save transaction
  const { mutate: saveTransaction } = useMutation({
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
  const { mutate: deleteTransactionMutation } = useMutation({
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

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setCategoryFilter("");
  };

  const hasActiveFilters = startDate || endDate || categoryFilter;

  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground mt-1">
              Manage all your transactions in one place
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Category
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
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

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              All Transactions ({transactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable
              transactions={transactions}
              categories={categories}
              wallets={wallets}
              onEdit={(t) => {
                setEditingTransaction(t);
                setFormOpen(true);
              }}
              onDelete={(id) => deleteTransactionMutation(id)}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Transaction Form */}
      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={async (t) => saveTransaction(t)}
        categories={categories}
        wallets={wallets}
        initialData={editingTransaction || undefined}
      />
    </Layout>
  );
}

export default withAuth(Transactions);
