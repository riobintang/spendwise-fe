import { useState, useEffect } from "react";
import { Transaction, TransactionType, Category, Wallet } from "@shared/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ReceiptScanner from "./ReceiptScanner";
import { Camera } from "lucide-react";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (transaction: Partial<Transaction>) => Promise<void>;
  categories: Category[];
  wallets: Wallet[];
  defaultType?: TransactionType;
  initialData?: Partial<Transaction>;
}

export default function TransactionForm({
  open,
  onOpenChange,
  onSubmit,
  categories,
  wallets,
  defaultType = TransactionType.EXPENSE,
  initialData,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [walletId, setWalletId] = useState(initialData?.walletId?.toString());
  const [categoryId, setCategoryId] = useState(initialData?.categoryId?.toString());
  const [amount, setAmount] = useState(initialData?.amount?.toString());
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    if (initialData?.type) {
      setType(initialData.type);
    }
    if (initialData?.walletId) {
      setWalletId(initialData.walletId.toString());
    }
    if (initialData?.categoryId) {
      setCategoryId(initialData.categoryId.toString());
    }
    if (initialData?.amount) {
      setAmount(initialData.amount.toString());
    }
    if (initialData?.description) {
      setDescription(initialData.description);
    }
    if (initialData?.date) {
      setDate(initialData.date);
    }
  }, [initialData, open]);

  const filteredCategories = categories?.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletId || !categoryId || !amount) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        walletId: parseInt(walletId),
        categoryId: parseInt(categoryId),
        type,
        amount: parseFloat(amount),
        description,
        date,
      });

      setWalletId(undefined);
      setCategoryId(undefined);
      setAmount(undefined);
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? "Edit" : "Add"}{" "}
            {type === TransactionType.INCOME ? "Income" : "Expense"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Tabs */}
          <div className="flex gap-2">
            {[TransactionType.INCOME, TransactionType.EXPENSE].map((t) => (
              <Button
                key={t}
                type="button"
                variant={type === t ? "default" : "outline"}
                onClick={() => {
                  setType(t);
                  setCategoryId(undefined);
                }}
                className="flex-1"
              >
                {t === TransactionType.INCOME ? "Income" : "Expense"}
              </Button>
            ))}
          </div>

          {/* Wallet Selection */}
          <div className="space-y-2">
            <Label htmlFor="wallet">Wallet</Label>
            <Select value={walletId} onValueChange={setWalletId}>
              <SelectTrigger id="wallet">
                <SelectValue placeholder="Select a wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id.toString()}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="flex gap-2">
              <Textarea
                id="description"
                placeholder="Add a note..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setScannerOpen(true)}
                title="Scan receipt"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Receipt Scanner */}
      <ReceiptScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onExtract={(data) => {
          if (data.merchant) setDescription(data.merchant);
          if (data.amount) setAmount(data.amount.toString());
          if (data.date) setDate(data.date);
          setScannerOpen(false);
        }}
      />
    </Dialog>
  );
}
