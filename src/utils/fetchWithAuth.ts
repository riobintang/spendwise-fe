import { getAuthToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Fetch with automatic authorization header to backend Express
 */
export async function fetchWithAuth(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    ...options?.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Use Next.js API proxy by default
  const fullUrl = url.startsWith("http")
    ? url
    : `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;

  return fetch(fullUrl, {
    ...options,
    headers,
  });
}
