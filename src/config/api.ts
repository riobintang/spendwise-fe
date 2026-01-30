/**
 * Centralized API Configuration
 * All API URLs should be defined here for easy maintenance
 */

// Backend API URL - use NEXT_PUBLIC_API_URL env var, default to localhost
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
  },
  TRANSACTIONS: "/transactions",
  CATEGORIES: "/categories",
  WALLETS: "/wallets",
  SUMMARY: "/summary",
  EXPORT: "/export",
} as const;

// Helper function to build full URL
export function buildApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}
