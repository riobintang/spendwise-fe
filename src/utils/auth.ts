/**
 * Authentication utilities for JWT-based auth
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

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

  const response = await fetch("http://localhost:8080/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  const result = await response.json();
  return {
    token: result.data.token,
    user: result.data,
  };
}

/**
 * Register user by calling backend API
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  if (!email || !password || !name) {
    throw new Error("All fields are required");
  }

  const response = await fetch("http://localhost:8080/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }

  const result = await response.json();
  return {
    token: result.data.token,
    user: result.data,
  };
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
