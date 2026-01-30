/**
 * Authentication utilities for JWT-based auth
 */

import type { AuthResponse, AuthUser } from "@shared/api";
import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

/**
 * Get stored auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user
 */
export function getAuthUser(): AuthUser | null {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken() && !!getAuthUser();
}

/**
 * Store auth token and user
 */
export function setAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Clear auth data
 */
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Login user by calling backend API
 */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  const result = await response.json();
  const data = result?.data;

  if (!data?.token || !data?.id || !data?.email) {
    throw new Error("Invalid login response");
  }

  return {
    token: data.token,
    user: {
      id: data.id,
      email: data.email,
      name: data.name,
    },
  };
}

/**
 * Register user by calling backend API
 * Note: Registration does not auto-login. User must login after registration.
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<AuthUser> {
  if (!email || !password || !name) {
    throw new Error("All fields are required");
  }

  const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.REGISTER), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }

  const result = await response.json();
  const userData = result?.data;

  if (!userData || !userData.id || !userData.email) {
    throw new Error("Invalid register response");
  }

  return userData as AuthUser;
}

/**
 * Logout user
 */
export function logoutUser(): void {
  clearAuth();
}

/**
 * Get authorization header for API calls
 */
export function getAuthHeader(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
