import { getAuthToken } from "./auth";

const API_BASE_URL = 'http://localhost:8080';

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

  // Convert relative URL to absolute backend URL
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.replace('/api', '')}`;

  return fetch(fullUrl, {
    ...options,
    headers,
  });
}
