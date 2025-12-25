/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

// Authentication Types
export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Transaction Types
export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Wallet {
  id: number;
  name: string;
  type: "cash" | "bank" | "e-wallet";
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  receiptImage?: string;
  createdAt: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: Record<string, number>;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface Insight {
  id: number;
  type: "pattern" | "alert" | "suggestion";
  message: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

// API Response Types
export interface TransactionsResponse {
  transactions: Transaction[];
  summary: TransactionSummary;
}

export interface SummaryResponse {
  current: TransactionSummary;
  monthly: MonthlySummary[];
}

export interface InsightsResponse {
  insights: Insight[];
}

export interface DemoResponse {
  message: string;
}
