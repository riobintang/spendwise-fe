import {
  Transaction,
  Category,
  Wallet,
  TransactionType,
  TransactionsResponse,
  SummaryResponse,
  MonthlySummary,
  AuthResponse,
  AuthUser,
} from "@shared/api";
import {
  runtimeTransactions,
  runtimeCategories,
  runtimeWallets,
  mockDemoUser,
} from "./mockData";

// API base URL for Next.js
const API_BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:8080';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate summary from transactions
 */
function calculateSummary(transactions: Transaction[]) {
  const summary = {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    byCategory: {} as Record<string, number>,
  };

  transactions.forEach((t) => {
    if (t.type === TransactionType.INCOME) {
      summary.totalIncome += t.amount;
    } else {
      summary.totalExpense += t.amount;
    }

    if (!summary.byCategory[t.categoryId]) {
      summary.byCategory[t.categoryId] = 0;
    }

    if (t.type === TransactionType.INCOME) {
      summary.byCategory[t.categoryId] += t.amount;
    } else {
      summary.byCategory[t.categoryId] -= t.amount;
    }
  });

  summary.balance = summary.totalIncome - summary.totalExpense;
  return summary;
}

/**
 * Generate monthly data from transactions
 */
function generateMonthlyData(transactions: Transaction[]): MonthlySummary[] {
  const monthMap = new Map<string, { income: number; expense: number }>();

  transactions.forEach((t) => {
    const monthKey = t.date.substring(0, 7); // YYYY-MM
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { income: 0, expense: 0 });
    }

    const month = monthMap.get(monthKey)!;
    if (t.type === TransactionType.INCOME) {
      month.income += t.amount;
    } else {
      month.expense += t.amount;
    }
  });

  // Get date range
  let monthRange: string[] = [];
  if (transactions.length > 0) {
    const dates = transactions.map((t) => t.date.substring(0, 7)).sort();
    const earliestMonth = dates[0];
    const latestMonth = dates[dates.length - 1];

    const [startYear, startMonth] = earliestMonth.split("-");
    const [endYear, endMonth] = latestMonth.split("-");

    let current = new Date(parseInt(startYear), parseInt(startMonth) - 1);
    const end = new Date(parseInt(endYear), parseInt(endMonth) - 1);

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      monthRange.push(`${year}-${month}`);
      current.setMonth(current.getMonth() + 1);
    }
  }

  // Format month labels
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return monthRange.map((monthKey) => {
    const data = monthMap.get(monthKey) || { income: 0, expense: 0 };
    const [year, month] = monthKey.split("-");
    const monthLabel = `${monthNames[parseInt(month) - 1]} ${year}`;

    return {
      month: monthLabel,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    };
  });
}

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Demo user credentials
  if (email === "demo@example.com" && password === "demo") {
    return {
      token: `token-${generateId()}`,
      user: mockDemoUser as AuthUser,
    };
  }

  throw new Error("Invalid email or password");
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!email || !password || !name) {
    throw new Error("All fields are required");
  }

  return {
    token: `token-${generateId()}`,
    user: {
      id: generateId(),
      email,
      name,
    },
  };
}

// ============================================================================
// TRANSACTION ENDPOINTS
// ============================================================================

export async function getTransactions(
  startDate?: string,
  endDate?: string,
  categoryId?: string
): Promise<TransactionsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let filtered = [...runtimeTransactions];

  // Apply filters
  if (startDate) {
    filtered = filtered.filter((t) => t.date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter((t) => t.date <= endDate);
  }
  if (categoryId) {
    filtered = filtered.filter((t) => t.categoryId === categoryId);
  }

  const summary = calculateSummary(filtered);

  return {
    transactions: filtered,
    summary,
  };
}

export async function createTransaction(
  data: Omit<Transaction, "id" | "createdAt">
): Promise<Transaction> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const transaction: Transaction = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  runtimeTransactions.unshift(transaction);
  return transaction;
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, "id" | "createdAt">>
): Promise<Transaction> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const index = runtimeTransactions.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Transaction not found");

  const updated = { ...runtimeTransactions[index], ...data };
  runtimeTransactions[index] = updated;

  return updated;
}

export async function deleteTransaction(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const index = runtimeTransactions.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Transaction not found");

  runtimeTransactions.splice(index, 1);
}

// ============================================================================
// CATEGORY ENDPOINTS
// ============================================================================

export async function getCategories(): Promise<Category[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return runtimeCategories;
}

export async function createCategory(
  data: Omit<Category, "id">
): Promise<Category> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const category: Category = {
    ...data,
    id: generateId(),
  };

  runtimeCategories.push(category);
  return category;
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id">>
): Promise<Category> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const index = runtimeCategories.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Category not found");

  const updated = { ...runtimeCategories[index], ...data };
  runtimeCategories[index] = updated;

  return updated;
}

export async function deleteCategory(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const index = runtimeCategories.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Category not found");

  runtimeCategories.splice(index, 1);
}

// ============================================================================
// WALLET ENDPOINTS
// ============================================================================

export async function getWallets(): Promise<Wallet[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return runtimeWallets;
}

export async function createWallet(
  data: Omit<Wallet, "id">
): Promise<Wallet> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const wallet: Wallet = {
    ...data,
    id: generateId(),
  };

  runtimeWallets.push(wallet);
  return wallet;
}

export async function updateWallet(
  id: string,
  data: Partial<Omit<Wallet, "id">>
): Promise<Wallet> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const index = runtimeWallets.findIndex((w) => w.id === id);
  if (index === -1) throw new Error("Wallet not found");

  const updated = { ...runtimeWallets[index], ...data };
  runtimeWallets[index] = updated;

  return updated;
}

export async function deleteWallet(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const index = runtimeWallets.findIndex((w) => w.id === id);
  if (index === -1) throw new Error("Wallet not found");

  runtimeWallets.splice(index, 1);
}

// ============================================================================
// SUMMARY ENDPOINTS
// ============================================================================

export async function getSummary(
  startDate?: string,
  endDate?: string
): Promise<SummaryResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let filtered = runtimeTransactions;

  if (startDate || endDate) {
    filtered = runtimeTransactions.filter((t) => {
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });
  }

  const current = calculateSummary(filtered);
  const monthly = generateMonthlyData(filtered);

  return {
    current,
    monthly,
  };
}

// ============================================================================
// EXPORT ENDPOINTS
// ============================================================================

export async function exportTransactions(
  format: "json" | "csv" | "excel",
  startDate?: string,
  endDate?: string
): Promise<{
  data: string | Uint8Array;
  filename: string;
  mimeType: string;
}> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Filter transactions by date
  let filtered = runtimeTransactions;
  if (startDate || endDate) {
    filtered = filtered.filter((t) => {
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });
  }

  if (filtered.length === 0) {
    throw new Error("No transactions found for the selected date range");
  }

  const timestamp = new Date().toISOString().split("T")[0];

  if (format === "json") {
    return {
      data: JSON.stringify(filtered, null, 2),
      filename: `transactions_${timestamp}.json`,
      mimeType: "application/json",
    };
  }

  if (format === "csv") {
    const headers = [
      "Date",
      "Description",
      "Category",
      "Wallet",
      "Type",
      "Amount",
    ];

    const rows = filtered.map((t) => {
      const category = runtimeCategories.find((c) => c.id === t.categoryId);
      const wallet = runtimeWallets.find((w) => w.id === t.walletId);

      return [
        t.date,
        t.description,
        category?.name || "Unknown",
        wallet?.name || "Unknown",
        t.type,
        t.amount.toString(),
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" && cell.includes(",")
              ? `"${cell}"`
              : cell
          )
          .join(",")
      ),
    ].join("\n");

    return {
      data: csvContent,
      filename: `transactions_${timestamp}.csv`,
      mimeType: "text/csv",
    };
  }

  if (format === "excel") {
    // For Excel, return JSON data and let the client handle XLSX generation
    return {
      data: JSON.stringify({
        transactions: filtered,
        categories: runtimeCategories,
        wallets: runtimeWallets,
      }),
      filename: `transactions_${timestamp}.xlsx`,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  throw new Error(`Unsupported export format: ${format}`);
}
