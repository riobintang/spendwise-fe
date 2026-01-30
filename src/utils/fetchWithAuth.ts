import { getAuthToken } from "./auth";
import { API_BASE_URL, buildApiUrl } from "@/config/api";

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
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Build full URL
  const fullUrl = url.startsWith("http")
    ? url
    : buildApiUrl(url.startsWith("/") ? url : `/${url}`);

  return fetch(fullUrl, {
    ...options,
    headers,
  });
}
