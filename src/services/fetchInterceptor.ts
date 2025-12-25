import * as api from "./api";
import { getAuthToken } from "@/utils/auth";

/**
 * Mock Response object compatible with standard Fetch API
 */
class MockResponse {
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly ok: boolean;
  readonly body: null = null;
  readonly bodyUsed: boolean = false;
  readonly redirected: boolean = false;
  readonly type: any = "basic";
  readonly url: string = "";

  private _text: string;
  private _textUsed: boolean = false;

  constructor(
    status: number,
    statusText: string,
    data: unknown,
    headers: Record<string, string> = {}
  ) {
    this.status = status;
    this.statusText = statusText;
    this.ok = status >= 200 && status < 300;

    this._text = JSON.stringify(data);

    const defaultHeaders: Record<string, string> = {
      "content-type": "application/json",
      ...headers,
    };

    this.headers = new Headers(defaultHeaders);
  }

  async text(): Promise<string> {
    if (this._textUsed) {
      throw new Error("Response body already read");
    }
    this._textUsed = true;
    return this._text;
  }

  async json(): Promise<unknown> {
    const text = await this.text();
    return JSON.parse(text);
  }

  async blob(): Promise<Blob> {
    const text = await this.text();
    return new Blob([text], { type: "application/json" });
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const blob = await this.blob();
    return blob.arrayBuffer();
  }

  async formData(): Promise<FormData> {
    throw new Error("formData not supported in mock");
  }

  clone(): Response {
    return new MockResponse(this.status, this.statusText, this._text, {
      "content-type": "application/json",
    }) as any as Response;
  }

  async bytes(): Promise<Uint8Array> {
    const text = await this.text();
    const encoder = new TextEncoder();
    return encoder.encode(text);
  }
}

/**
 * Handle API requests and route to mock service
 */
async function handleApiRequest(
  url: string,
  init?: RequestInit
): Promise<Response | any> {
  const method = (init?.method || "GET").toUpperCase();
  const body = init?.body ? JSON.parse(init.body as string) : null;
  const token = getAuthToken();

  try {
    // Check authorization header
    const authHeader = init?.headers as any;
    if (token && authHeader?.Authorization !== `Bearer ${token}`) {
      // For demo purposes, we'll accept any request with or without token
    }

    // ====== AUTHENTICATION ENDPOINTS ======
    if (url === "/api/login" && method === "POST") {
      const response = await api.login(body.email, body.password);
      return new MockResponse(200, "OK", response);
    }

    if (url === "/api/register" && method === "POST") {
      const response = await api.register(body.email, body.password, body.name);
      return new MockResponse(200, "OK", response);
    }

    // ====== TRANSACTION ENDPOINTS ======
    if (url === "/api/transactions" && method === "GET") {
      const response = await api.getTransactions();
      return new MockResponse(200, "OK", response);
    }

    if (url === "/api/transactions" && method === "POST") {
      const response = await api.createTransaction(body);
      return new MockResponse(201, "Created", response);
    }

    if (url.match(/^\/api\/transactions\/[^\/]+$/) && method === "PUT") {
      const id = url.split("/").pop()!;
      const response = await api.updateTransaction(id, body);
      return new MockResponse(200, "OK", response);
    }

    if (url.match(/^\/api\/transactions\/[^\/]+$/) && method === "DELETE") {
      const id = url.split("/").pop()!;
      await api.deleteTransaction(id);
      return new MockResponse(204, "No Content", {});
    }

    // ====== CATEGORY ENDPOINTS ======
    if (url === "/api/categories" && method === "GET") {
      const response = await api.getCategories();
      return new MockResponse(200, "OK", response);
    }

    if (url === "/api/categories" && method === "POST") {
      const response = await api.createCategory(body);
      return new MockResponse(201, "Created", response);
    }

    if (url.match(/^\/api\/categories\/[^\/]+$/) && method === "PUT") {
      const id = url.split("/").pop()!;
      const response = await api.updateCategory(id, body);
      return new MockResponse(200, "OK", response);
    }

    if (url.match(/^\/api\/categories\/[^\/]+$/) && method === "DELETE") {
      const id = url.split("/").pop()!;
      await api.deleteCategory(id);
      return new MockResponse(204, "No Content", {});
    }

    // ====== WALLET ENDPOINTS ======
    if (url === "/api/wallets" && method === "GET") {
      const response = await api.getWallets();
      return new MockResponse(200, "OK", response);
    }

    if (url === "/api/wallets" && method === "POST") {
      const response = await api.createWallet(body);
      return new MockResponse(201, "Created", response);
    }

    if (url.match(/^\/api\/wallets\/[^\/]+$/) && method === "PUT") {
      const id = url.split("/").pop()!;
      const response = await api.updateWallet(id, body);
      return new MockResponse(200, "OK", response);
    }

    if (url.match(/^\/api\/wallets\/[^\/]+$/) && method === "DELETE") {
      const id = url.split("/").pop()!;
      await api.deleteWallet(id);
      return new MockResponse(204, "No Content", {});
    }

    // ====== SUMMARY ENDPOINTS ======
    if (url.startsWith("/api/summary")) {
      // Parse query parameters
      const urlObj = new URL(url, "http://localhost");
      const startDate = urlObj.searchParams.get("startDate") || undefined;
      const endDate = urlObj.searchParams.get("endDate") || undefined;

      const response = await api.getSummary(startDate, endDate);
      return new MockResponse(200, "OK", response);
    }

    // ====== EXPORT ENDPOINTS ======
    if (url.startsWith("/api/export")) {
      const urlObj = new URL(url, "http://localhost");
      const format = (urlObj.searchParams.get("format") ||
        "json") as "json" | "csv" | "excel";
      const startDate = urlObj.searchParams.get("startDate") || undefined;
      const endDate = urlObj.searchParams.get("endDate") || undefined;

      const response = await api.exportTransactions(format, startDate, endDate);
      return new MockResponse(200, "OK", response);
    }

    // Unknown endpoint
    return new MockResponse(404, "Not Found", { error: "Endpoint not found" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new MockResponse(400, "Bad Request", { error: errorMessage });
  }
}

/**
 * Install the fetch interceptor (globally override fetch for /api/* calls)
 */
export function installFetchInterceptor() {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url = typeof input === "string" ? input : input.toString();

    // Route API calls to mock service
    if (url.startsWith("/api/")) {
      return handleApiRequest(url, init);
    }

    // For other URLs, use the original fetch
    return originalFetch(input, init);
  };
}
