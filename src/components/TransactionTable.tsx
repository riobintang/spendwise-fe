import { Transaction, Category, Wallet } from "@shared/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function TransactionTable({
  transactions,
  categories,
  wallets,
  onEdit,
  onDelete,
  isLoading = false,
}: TransactionTableProps) {
  const getCategoryName = (id: number) => {
    return categories.find((c) => c.id === id)?.name || "Unknown";
  };

  const getWalletName = (id: number) => {
    return wallets.find((w) => w.id === id)?.name || "Unknown";
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Wallet</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{formatDate(transaction.date)}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{getCategoryName(transaction.categoryId)}</TableCell>
              <TableCell>{getWalletName(transaction.walletId)}</TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    transaction.type === "income"
                      ? "text-success font-semibold"
                      : "text-destructive font-semibold"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(transaction)}
                    disabled={isLoading}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(transaction.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
