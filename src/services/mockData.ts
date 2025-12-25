import { Transaction, Category, Wallet, TransactionType } from "@shared/api";

// Mock demo user
export const mockDemoUser = {
  id: "demo-user",
  email: "demo@example.com",
  name: "Demo User",
};

// Generate mock transactions with varied dates
function generateMockTransactions(): Transaction[] {
  const today = new Date();
  const transactions: Transaction[] = [];
  let id = 1;

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    const dateStr = date.toISOString().split("T")[0];

    // Income transactions
    if (Math.random() > 0.7) {
      transactions.push({
        id: `tx-${id++}`,
        walletId: "wallet-1",
        categoryId: "income-salary",
        type: TransactionType.INCOME,
        amount: 5000 + Math.random() * 2000,
        description: "Monthly salary",
        date: dateStr,
        createdAt: new Date(date).toISOString(),
      });
    } else {
      // Expense transactions
      const expenseCategories = [
        { id: "food", amount: 45 + Math.random() * 55, desc: "Restaurant" },
        { id: "transport", amount: 10 + Math.random() * 30, desc: "Uber/Taxi" },
        { id: "shopping", amount: 50 + Math.random() * 150, desc: "Clothes shopping" },
        { id: "utilities", amount: 80 + Math.random() * 60, desc: "Utilities" },
        { id: "entertainment", amount: 20 + Math.random() * 80, desc: "Movie/Games" },
      ];

      const expense = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      transactions.push({
        id: `tx-${id++}`,
        walletId: "wallet-1",
        categoryId: expense.id,
        type: TransactionType.EXPENSE,
        amount: Math.round(expense.amount * 100) / 100,
        description: expense.desc,
        date: dateStr,
        createdAt: new Date(date).toISOString(),
      });
    }
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Mock categories
export const mockCategories: Category[] = [
  {
    id: "income-salary",
    name: "Salary",
    icon: "banknote",
    color: "#10b981",
    type: TransactionType.INCOME,
  },
  {
    id: "income-bonus",
    name: "Bonus",
    icon: "gift",
    color: "#10b981",
    type: TransactionType.INCOME,
  },
  {
    id: "food",
    name: "Food & Dining",
    icon: "utensils",
    color: "#f97316",
    type: TransactionType.EXPENSE,
  },
  {
    id: "transport",
    name: "Transport",
    icon: "car",
    color: "#3b82f6",
    type: TransactionType.EXPENSE,
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "shopping-bag",
    color: "#ec4899",
    type: TransactionType.EXPENSE,
  },
  {
    id: "utilities",
    name: "Utilities",
    icon: "zap",
    color: "#eab308",
    type: TransactionType.EXPENSE,
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "popcorn",
    color: "#a855f7",
    type: TransactionType.EXPENSE,
  },
];

// Mock wallets
export const mockWallets: Wallet[] = [
  {
    id: "wallet-1",
    name: "Main Account",
    type: "bank",
    balance: 5000,
    currency: "USD",
  },
  {
    id: "wallet-2",
    name: "Cash",
    type: "cash",
    balance: 500,
    currency: "USD",
  },
];

// Store for runtime mutations
export let runtimeTransactions: Transaction[] = generateMockTransactions();
export let runtimeCategories: Category[] = [...mockCategories];
export let runtimeWallets: Wallet[] = [...mockWallets];

export function resetMockData() {
  runtimeTransactions = generateMockTransactions();
  runtimeCategories = [...mockCategories];
  runtimeWallets = [...mockWallets];
}
