import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet } from "@shared/api";
import { Plus, Edit2, Trash2, Wallet as WalletIcon } from "lucide-react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { ResponseBody } from "@/utils/responseBody";

type WalletType = "cash" | "bank" | "e_wallet";

export default function Wallets() {
  const queryClient = useQueryClient();

  // Form states
  const [walletName, setWalletName] = useState("");
  const [walletType, setWalletType] = useState<WalletType>("cash");
  const [walletCurrency, setWalletCurrency] = useState("IDR");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch wallets
  const { data: walletsData } = useQuery<ResponseBody<Wallet[]>>({
    queryKey: ["wallets"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/wallets");
      return res.json();
    },
  });

  const wallets = walletsData?.data || [];

  // Create wallet mutation
  const { mutate: createWallet, isPending: isCreating } = useMutation({
    mutationFn: async (data: {
      name: string;
      type: WalletType;
      currency: string;
    }) => {
      const res = await fetchWithAuth("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create wallet");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      resetForm();
    },
  });

  // Update wallet mutation
  const { mutate: updateWalletMutation, isPending: isUpdating } = useMutation({
    mutationFn: async (data: {
      id: string;
      name: string;
      type: WalletType;
      currency: string;
    }) => {
      const res = await fetchWithAuth(`/api/wallets/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          type: data.type,
          currency: data.currency,
        }),
      });

      if (!res.ok) throw new Error("Failed to update wallet");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      resetForm();
    },
  });

  // Delete wallet mutation
  const { mutate: deleteWallet, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/wallets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete wallet");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      setDeleteConfirmId(null);
    },
  });

  const resetForm = () => {
    setWalletName("");
    setWalletType("cash");
    setWalletCurrency("IDR");
    setEditingId(null);
  };

  const handleEdit = (wallet: Wallet) => {
    setWalletName(wallet.name);
    setWalletType(wallet.type as WalletType);
    setWalletCurrency(wallet.currency);
    setEditingId(wallet.id);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletName.trim()) {
      alert("Please enter a wallet name");
      return;
    }

    if (editingId) {
      updateWalletMutation({
        id: editingId,
        name: walletName,
        type: walletType,
        currency: walletCurrency,
      });
    } else {
      createWallet({
        name: walletName,
        type: walletType,
        currency: walletCurrency,
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteWallet(id);
  };

  const getWalletTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cash: "Cash",
      bank: "Bank Account",
      e_wallet: "E-Wallet",
    };
    return labels[type] || type;
  };

  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Wallets & Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your wallets, bank accounts, and e-wallets
          </p>
        </div>

        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Wallet" : "Create New Wallet"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="name">Wallet Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Main Cash"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={walletType}
                    onValueChange={(value) => setWalletType(value as WalletType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Account</SelectItem>
                      <SelectItem value="e_wallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    type="text"
                    placeholder="e.g., IDR"
                    value={walletCurrency}
                    onChange={(e) => setWalletCurrency(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {editingId ? "Update" : "Create"}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Wallets List */}
        {wallets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Wallets ({wallets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <WalletIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{wallet.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {getWalletTypeLabel(wallet.type)} • {wallet.currency}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(wallet)}
                        disabled={isUpdating || isDeleting}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirmId(wallet.id)}
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this wallet? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmId) {
                  handleDelete(deleteConfirmId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
