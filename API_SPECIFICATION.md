# SpendWise API Specification

## Overview

This document describes the complete REST API for the SpendWise personal finance management application. The API provides endpoints for authentication, transaction management, category management, wallet management, statistical reports, and data export.

---

## General API Information

### Base URL
```
https://api.spendwise.com
```

For development:
```
http://localhost:3001
```

### API Version
```
v1
```

### Content Type
All requests and responses use:
```
Content-Type: application/json
```

### Authentication
Most endpoints require JWT (JSON Web Token) authentication via the `Authorization` header:
```
Authorization: Bearer {token}
```

The token is obtained from the `/auth/login` or `/auth/register` endpoints and must be included in subsequent requests.

### Request/Response Format
All requests should include JSON in the request body.
All responses return JSON data.

### Common Error Response Format
All error responses follow this format:

```json
{
  "error": "Error description",
  "statusCode": 400,
  "timestamp": "2025-01-20T10:30:00Z"
}
```

### HTTP Status Codes
- `200 OK` - Successful GET, PUT requests
- `201 Created` - Successful POST request (resource created)
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid request parameters or body
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User lacks permission to access resource
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Request validation failed
- `500 Internal Server Error` - Server-side error

---

## Authentication Endpoints

### POST /auth/login

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid email or password",
  "statusCode": 401
}
```

**Required Fields:**
- `email` (string) - User email address
- `password` (string) - User password

**Notes:**
- Passwords must be at least 6 characters long
- Returned token should be stored on the client and included in subsequent requests
- Token expiration time should be configurable (recommended: 24 hours)

---

### POST /auth/register

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-456",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Email already exists",
  "statusCode": 400
}
```

**Required Fields:**
- `name` (string) - User's full name
- `email` (string) - User email address (must be unique)
- `password` (string) - User password (minimum 6 characters)

**Validation Rules:**
- Email must be valid email format
- Password must be at least 6 characters
- Name must not be empty
- Email must be unique across all users

**Notes:**
- Automatically logs the user in and returns a JWT token
- Passwords should be hashed using bcrypt or similar algorithm
- Default wallet should be created for new users

---

## Transactions Endpoints

### Transaction Object Schema

```json
{
  "id": "tx-123abc",
  "walletId": "wallet-1",
  "categoryId": "food",
  "type": "expense",
  "amount": 45.50,
  "description": "Lunch at restaurant",
  "date": "2025-01-20",
  "receiptImage": "https://storage.example.com/receipts/tx-123abc.jpg",
  "createdAt": "2025-01-20T10:30:00Z"
}
```

**Field Definitions:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique transaction identifier |
| `walletId` | string | Reference to the wallet used in transaction |
| `categoryId` | string | Reference to the category of transaction |
| `type` | string | Either "income" or "expense" |
| `amount` | number | Transaction amount (positive number) |
| `description` | string | Transaction description/memo |
| `date` | string | Transaction date in YYYY-MM-DD format |
| `receiptImage` | string (optional) | URL to receipt image |
| `createdAt` | string | ISO 8601 timestamp when transaction was created |

---

### GET /transactions

Retrieves all transactions for the authenticated user with optional filtering.

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Filter transactions from this date (YYYY-MM-DD) |
| `endDate` | string | No | Filter transactions until this date (YYYY-MM-DD) |
| `categoryId` | string | No | Filter by category ID |
| `type` | string | No | Filter by type: "income" or "expense" |
| `walletId` | string | No | Filter by wallet ID |
| `skip` | number | No | Number of records to skip (pagination) |
| `limit` | number | No | Maximum number of records to return (default: 100, max: 1000) |

**Example Request:**
```
GET /transactions?startDate=2025-01-01&endDate=2025-01-31&type=expense&limit=50
```

**Response (200 OK):**
```json
{
  "transactions": [
    {
      "id": "tx-123abc",
      "walletId": "wallet-1",
      "categoryId": "food",
      "type": "expense",
      "amount": 45.50,
      "description": "Lunch at restaurant",
      "date": "2025-01-20",
      "createdAt": "2025-01-20T10:30:00Z"
    },
    {
      "id": "tx-456def",
      "walletId": "wallet-1",
      "categoryId": "salary",
      "type": "income",
      "amount": 5000.00,
      "description": "Monthly salary",
      "date": "2025-01-01",
      "createdAt": "2025-01-01T09:00:00Z"
    }
  ],
  "summary": {
    "totalIncome": 5000.00,
    "totalExpense": 45.50,
    "balance": 4954.50,
    "byCategory": {
      "salary": 5000.00,
      "food": -45.50
    }
  },
  "pagination": {
    "total": 25,
    "skip": 0,
    "limit": 50
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid or missing authentication token",
  "statusCode": 401
}
```

**Notes:**
- Returns transactions most recent first
- Summary includes totals for filtered results
- Income amounts are positive, expense amounts are shown as negative in byCategory

---

### POST /transactions

Creates a new transaction.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "walletId": "wallet-1",
  "categoryId": "food",
  "type": "expense",
  "amount": 45.50,
  "description": "Lunch at restaurant",
  "date": "2025-01-20",
  "receiptImage": "https://storage.example.com/receipts/abc123.jpg"
}
```

**Response (201 Created):**
```json
{
  "id": "tx-789ghi",
  "walletId": "wallet-1",
  "categoryId": "food",
  "type": "expense",
  "amount": 45.50,
  "description": "Lunch at restaurant",
  "date": "2025-01-20",
  "receiptImage": "https://storage.example.com/receipts/abc123.jpg",
  "createdAt": "2025-01-20T10:35:00Z"
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "error": "Invalid request: amount must be greater than 0",
  "statusCode": 422,
  "field": "amount"
}
```

**Required Fields:**
- `walletId` (string) - ID of wallet to use
- `categoryId` (string) - ID of category for transaction
- `type` (string) - "income" or "expense"
- `amount` (number) - Transaction amount (must be > 0)
- `date` (string) - Date in YYYY-MM-DD format

**Optional Fields:**
- `description` (string) - Transaction description
- `receiptImage` (string) - URL to receipt image

**Validation Rules:**
- Amount must be a positive number
- Date must be in valid YYYY-MM-DD format and not in the future
- Wallet and category must exist and belong to the authenticated user
- Type must be either "income" or "expense"

**Notes:**
- Wallet balance should be updated if applicable
- Transaction should be associated with the authenticated user

---

### PUT /transactions/:id

Updates an existing transaction.

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `id` (string) - Transaction ID

**Request Body:**
```json
{
  "categoryId": "transport",
  "description": "Uber ride",
  "amount": 25.00,
  "date": "2025-01-20"
}
```

**Response (200 OK):**
```json
{
  "id": "tx-789ghi",
  "walletId": "wallet-1",
  "categoryId": "transport",
  "type": "expense",
  "amount": 25.00,
  "description": "Uber ride",
  "date": "2025-01-20",
  "createdAt": "2025-01-20T10:35:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Transaction not found",
  "statusCode": 404
}
```

**Optional Fields:**
- `walletId` (string)
- `categoryId` (string)
- `amount` (number)
- `description` (string)
- `date` (string)
- `receiptImage` (string)

**Notes:**
- Type cannot be changed after creation
- Only the authenticated user can update their own transactions
- Wallet balances should be recalculated if amount changes

---

### DELETE /transactions/:id

Deletes a transaction.

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `id` (string) - Transaction ID

**Response (204 No Content):**
```
(empty body)
```

**Error Response (404 Not Found):**
```json
{
  "error": "Transaction not found",
  "statusCode": 404
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "You can only delete your own transactions",
  "statusCode": 403
}
```

**Notes:**
- Only the authenticated user can delete their own transactions
- Related wallet balance should be updated
- Consider soft deletes for audit trail purposes

---

## Categories Endpoints

### Category Object Schema

```json
{
  "id": "food",
  "name": "Food & Dining",
  "icon": "utensils",
  "color": "#f97316",
  "type": "expense"
}
```

**Field Definitions:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique category identifier |
| `name` | string | Category name |
| `icon` | string | Icon name (lucide-react compatible) |
| `color` | string | Hex color code (e.g., "#f97316") |
| `type` | string | "income" or "expense" |

**Default Categories:**

```json
[
  {
    "id": "income-salary",
    "name": "Salary",
    "icon": "banknote",
    "color": "#10b981",
    "type": "income"
  },
  {
    "id": "income-bonus",
    "name": "Bonus",
    "icon": "gift",
    "color": "#10b981",
    "type": "income"
  },
  {
    "id": "food",
    "name": "Food & Dining",
    "icon": "utensils",
    "color": "#f97316",
    "type": "expense"
  },
  {
    "id": "transport",
    "name": "Transport",
    "icon": "car",
    "color": "#3b82f6",
    "type": "expense"
  },
  {
    "id": "shopping",
    "name": "Shopping",
    "icon": "shopping-bag",
    "color": "#ec4899",
    "type": "expense"
  },
  {
    "id": "utilities",
    "name": "Utilities",
    "icon": "zap",
    "color": "#eab308",
    "type": "expense"
  },
  {
    "id": "entertainment",
    "name": "Entertainment",
    "icon": "popcorn",
    "color": "#a855f7",
    "type": "expense"
  }
]
```

---

### GET /categories

Retrieves all categories for the authenticated user.

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by type: "income" or "expense" |

**Example Request:**
```
GET /categories?type=expense
```

**Response (200 OK):**
```json
[
  {
    "id": "food",
    "name": "Food & Dining",
    "icon": "utensils",
    "color": "#f97316",
    "type": "expense"
  },
  {
    "id": "transport",
    "name": "Transport",
    "icon": "car",
    "color": "#3b82f6",
    "type": "expense"
  }
]
```

**Notes:**
- Returns both default system categories and user-created categories
- Default categories are available to all users
- Categories should be sorted alphabetically by name

---

### POST /categories

Creates a new custom category.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "name": "Subscriptions",
  "color": "#6366f1",
  "icon": "credit-card",
  "type": "expense"
}
```

**Response (201 Created):**
```json
{
  "id": "cat-custom-001",
  "name": "Subscriptions",
  "color": "#6366f1",
  "icon": "credit-card",
  "type": "expense"
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "error": "Category name already exists",
  "statusCode": 422
}
```

**Required Fields:**
- `name` (string) - Category name (3-50 characters)
- `type` (string) - "income" or "expense"
- `color` (string) - Hex color code (6 or 8 characters with #)
- `icon` (string) - Icon name from lucide-react

**Validation Rules:**
- Name must be unique per user
- Color must be valid hex format
- Icon must exist in lucide-react library
- Type must be "income" or "expense"

**Notes:**
- Custom categories can only be created by authenticated users
- Default categories cannot be modified or deleted

---

### PUT /categories/:id

Updates a custom category.

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `id` (string) - Category ID

**Request Body:**
```json
{
  "name": "Monthly Subscriptions",
  "color": "#8b5cf6",
  "icon": "credit-card"
}
```

**Response (200 OK):**
```json
{
  "id": "cat-custom-001",
  "name": "Monthly Subscriptions",
  "color": "#8b5cf6",
  "icon": "credit-card",
  "type": "expense"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Cannot modify default categories",
  "statusCode": 403
}
```

**Optional Fields:**
- `name` (string)
- `color` (string)
- `icon` (string)

**Notes:**
- Only custom categories can be modified
- Default categories cannot be updated
- Type cannot be changed

---

### DELETE /categories/:id

Deletes a custom category.

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `id` (string) - Category ID

**Response (204 No Content):**
```
(empty body)
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Cannot delete default categories",
  "statusCode": 403
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Category has 5 associated transactions. Please reassign them before deleting.",
  "statusCode": 400
}
```

**Notes:**
- Only custom categories can be deleted
- Default categories cannot be deleted
- If category has associated transactions, either:
  - Delete the category and cascade delete all transactions, OR
  - Require user to reassign transactions before deletion
  - Recommend: prevent deletion and inform user of transaction count

---

## Wallets Endpoints

### Wallet Object Schema

```json
{
  "id": "wallet-1",
  "name": "Main Account",
  "type": "bank",
  "balance": 5000.00,
  "currency": "USD"
}
```

**Field Definitions:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique wallet identifier |
| `name` | string | Wallet name |
| `type` | string | "cash", "bank", or "e-wallet" |
| `balance` | number | Current balance |
| `currency` | string | Currency code (e.g., "USD", "EUR") |

---

### GET /wallets

Retrieves all wallets for the authenticated user.

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
[
  {
    "id": "wallet-1",
    "name": "Main Account",
    "type": "bank",
    "balance": 5000.00,
    "currency": "USD"
  },
  {
    "id": "wallet-2",
    "name": "Cash",
    "type": "cash",
    "balance": 500.00,
    "currency": "USD"
  }
]
```

**Notes:**
- Each user should have at least one default wallet
- Balance is calculated from all transactions

---

### POST /wallets

Creates a new wallet.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "name": "Savings Account",
  "type": "bank",
  "balance": 10000.00,
  "currency": "USD"
}
```

**Response (201 Created):**
```json
{
  "id": "wallet-3",
  "name": "Savings Account",
  "type": "bank",
  "balance": 10000.00,
  "currency": "USD"
}
```

**Required Fields:**
- `name` (string) - Wallet name
- `type` (string) - "cash", "bank", or "e-wallet"
- `currency` (string) - Currency code (default: "USD")

**Optional Fields:**
- `balance` (number) - Initial balance (default: 0)

**Validation Rules:**
- Name must be unique per user
- Type must be one of the allowed types
- Currency must be valid ISO 4217 code
- Balance must be >= 0

---

### PUT /wallets/:id

Updates a wallet.

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `id` (string) - Wallet ID

**Request Body:**
```json
{
  "name": "Emergency Fund",
  "balance": 12000.00
}
```

**Response (200 OK):**
```json
{
  "id": "wallet-3",
  "name": "Emergency Fund",
  "type": "bank",
  "balance": 12000.00,
  "currency": "USD"
}
```

**Optional Fields:**
- `name` (string)
- `balance` (number)

**Notes:**
- Type and currency typically cannot be changed
- Balance updates should consider whether to override or recalculate from transactions

---

### DELETE /wallets/:id

Deletes a wallet.

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `id` (string) - Wallet ID

**Response (204 No Content):**
```
(empty body)
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Cannot delete wallet with associated transactions",
  "statusCode": 400
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Cannot delete the last wallet",
  "statusCode": 400
}
```

**Notes:**
- User must have at least one wallet
- Cannot delete wallet that has associated transactions
- Consider cascading transaction deletion if business rules allow

---

## Statistics Endpoints

### GET /stats/overview

Retrieves overview statistics for the authenticated user.

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Filter from this date (YYYY-MM-DD) |
| `endDate` | string | No | Filter until this date (YYYY-MM-DD) |

**Example Request:**
```
GET /stats/overview?startDate=2025-01-01&endDate=2025-01-31
```

**Response (200 OK):**
```json
{
  "totalIncome": 5000.00,
  "totalExpense": 1234.56,
  "balance": 3765.44,
  "transactionCount": 42,
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31"
}
```

**Notes:**
- If no date range provided, returns all-time statistics
- Balance is calculated as totalIncome - totalExpense

---

### GET /stats/monthly

Retrieves monthly income vs expense data for chart visualization.

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | First month (YYYY-MM-DD) |
| `endDate` | string | No | Last month (YYYY-MM-DD) |

**Example Request:**
```
GET /stats/monthly?startDate=2024-11-01&endDate=2025-01-31
```

**Response (200 OK):**
```json
[
  {
    "month": "Nov 2024",
    "income": 5000.00,
    "expense": 1100.00,
    "balance": 3900.00
  },
  {
    "month": "Dec 2024",
    "income": 5500.00,
    "expense": 1300.00,
    "balance": 4200.00
  },
  {
    "month": "Jan 2025",
    "income": 5000.00,
    "expense": 1234.56,
    "balance": 3765.44
  }
]
```

**Month Format:**
- Format: "MMM YYYY" (e.g., "Jan 2025", "Feb 2025")
- Array should include ALL months in the date range, even if they have zero transactions
- Months with zero transactions should show income: 0, expense: 0, balance: 0

**Notes:**
- Used for bar chart displaying monthly trends
- If no date range provided, returns last 12 months
- Data should be sorted chronologically

---

### GET /stats/by-category

Retrieves spending breakdown by category.

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by "income" or "expense" |
| `startDate` | string | No | Filter from this date (YYYY-MM-DD) |
| `endDate` | string | No | Filter until this date (YYYY-MM-DD) |

**Example Request:**
```
GET /stats/by-category?type=expense&startDate=2025-01-01&endDate=2025-01-31
```

**Response (200 OK):**
```json
[
  {
    "id": "food",
    "name": "Food & Dining",
    "value": 456.78,
    "color": "#f97316",
    "percentage": 37.1,
    "transactionCount": 12
  },
  {
    "id": "transport",
    "name": "Transport",
    "value": 120.00,
    "color": "#3b82f6",
    "percentage": 9.7,
    "transactionCount": 5
  },
  {
    "id": "shopping",
    "name": "Shopping",
    "value": 350.00,
    "color": "#ec4899",
    "percentage": 28.4,
    "transactionCount": 3
  }
]
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Category ID |
| `name` | string | Category name |
| `value` | number | Total amount spent in category |
| `color` | string | Category hex color |
| `percentage` | number | Percentage of total spending (rounded to 1 decimal) |
| `transactionCount` | number | Number of transactions in category |

**Notes:**
- Should only include categories with at least one transaction
- Array should be sorted by value (highest first)
- Used for pie chart visualization
- If no date range provided, returns all-time breakdown

---

## Export Endpoints

### GET /transactions/export

Exports transactions in the requested format.

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | Yes | Export format: "csv", "json", or "xlsx" |
| `startDate` | string | No | Export from this date (YYYY-MM-DD) |
| `endDate` | string | No | Export until this date (YYYY-MM-DD) |

**Example Requests:**
```
GET /transactions/export?format=csv&startDate=2025-01-01&endDate=2025-01-31
GET /transactions/export?format=xlsx
GET /transactions/export?format=json
```

**Response (200 OK):**
- Content-Type depends on format:
  - CSV: `text/csv`
  - JSON: `application/json`
  - XLSX: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Response Headers:**
```
Content-Disposition: attachment; filename="transactions_2025-01-20.csv"
```

#### CSV Format
```
Date,Description,Category,Wallet,Type,Amount
2025-01-20,Lunch at restaurant,Food & Dining,Main Account,expense,45.50
2025-01-19,Grocery shopping,Shopping,Main Account,expense,120.75
2025-01-01,Monthly salary,Salary,Main Account,income,5000.00
```

**CSV Structure:**
- Headers: Date, Description, Category, Wallet, Type, Amount
- Dates in YYYY-MM-DD format
- Amounts as decimal numbers
- Escaped values with commas

#### JSON Format
```json
[
  {
    "id": "tx-123abc",
    "walletId": "wallet-1",
    "categoryId": "food",
    "type": "expense",
    "amount": 45.50,
    "description": "Lunch at restaurant",
    "date": "2025-01-20",
    "createdAt": "2025-01-20T10:30:00Z"
  },
  {
    "id": "tx-456def",
    "walletId": "wallet-1",
    "categoryId": "shopping",
    "type": "expense",
    "amount": 120.75,
    "description": "Grocery shopping",
    "date": "2025-01-19",
    "createdAt": "2025-01-19T14:15:00Z"
  }
]
```

#### XLSX Format
- Sheet name: "Transactions"
- Columns: Date, Description, Category, Wallet, Type, Amount
- Headers: Bold, gray background
- Auto-sized columns
- Dates in YYYY-MM-DD format

**Error Response (400 Bad Request):**
```json
{
  "error": "No transactions found for the selected date range",
  "statusCode": 400
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid format. Must be 'csv', 'json', or 'xlsx'",
  "statusCode": 400
}
```

**Notes:**
- If no date range specified, export all transactions
- Filename should follow pattern: `transactions_YYYY-MM-DD.{extension}`
- Exported data should use authenticated user's transactions only
- Large exports may need pagination support (consider limits)

---

## Combining Statistics: The Summary Endpoint

### GET /stats/summary (Alternative: GET /summary)

Some implementations may want a single endpoint that returns overview + monthly data together.

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Filter from this date (YYYY-MM-DD) |
| `endDate` | string | No | Filter until this date (YYYY-MM-DD) |

**Response (200 OK):**
```json
{
  "current": {
    "totalIncome": 5000.00,
    "totalExpense": 1234.56,
    "balance": 3765.44,
    "byCategory": {
      "food": -456.78,
      "transport": -120.00,
      "salary": 5000.00
    }
  },
  "monthly": [
    {
      "month": "Jan 2025",
      "income": 5000.00,
      "expense": 1234.56,
      "balance": 3765.44
    }
  ]
}
```

**Notes:**
- Optional alternative to separate endpoints
- Reduces number of API calls needed by frontend
- Frontend currently uses this pattern in mock service

---

## Rate Limiting (Recommended)

Implement rate limiting to prevent abuse:

- **Authentication endpoints:** 5 requests per minute per IP
- **Transaction endpoints:** 100 requests per minute per user
- **Other endpoints:** 60 requests per minute per user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705772400
```

**Error Response (429 Too Many Requests):**
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "statusCode": 429,
  "retryAfter": 30
}
```

---

## Data Validation and Constraints

### Currency Codes
Supported currency codes: USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, etc.
- Use ISO 4217 standard codes
- Default: USD

### Amount Precision
- All monetary amounts should use 2 decimal places
- Store as decimal/numeric type (not float) to avoid precision issues

### Date Format
- All dates: YYYY-MM-DD (ISO 8601)
- All timestamps: ISO 8601 with timezone (e.g., 2025-01-20T10:30:00Z)

### ID Generation
- Use UUID v4 or similar for transaction/category/wallet IDs
- Ensure IDs are unique across all users
- IDs should be treated as opaque strings by clients

### Password Requirements
- Minimum 6 characters (recommend 8+)
- Should hash with bcrypt (cost factor 10+)
- Never return passwords in API responses

---

## CORS and Security

### CORS Headers (Recommended)
```
Access-Control-Allow-Origin: https://app.spendwise.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

### Security Headers (Recommended)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

### Input Validation
- Sanitize all string inputs to prevent injection attacks
- Validate email format using RFC 5322 standard
- Validate amount fields are positive numbers
- Validate date fields are in YYYY-MM-DD format
- Validate hex colors are valid 6 or 8 character hex codes

---

## Implementation Notes

### Database Considerations
- Use foreign keys to enforce referential integrity
- Create indexes on frequently queried fields: userId, date, categoryId, walletId, type
- Consider partitioning transactions table by userId or date for performance

### Timezone Handling
- Store all dates/timestamps in UTC
- Client should handle timezone conversion for display
- Allow user timezone preference in settings

### Wallet Balance Tracking
Decide on balance calculation strategy:
- **Option A:** Calculate from transactions on-the-fly (accurate, slower)
- **Option B:** Maintain running balance in database (faster, requires careful updates)
- **Option C:** Cache balance with periodic reconciliation

### Cascade Behavior
Define cascade rules for data deletion:
- Deleting user → delete all transactions, wallets, categories
- Deleting wallet → require reassignment or cascade delete transactions
- Deleting category → require reassignment or cascade delete transactions

### Audit Trail
Consider maintaining audit logs for:
- Transaction modifications
- Category changes
- Wallet balance adjustments
- User login/logout

---

## Example API Usage Flow

### 1. Register User
```
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
Returns: token and user object
```

### 2. Create Transaction
```
POST /transactions
Header: Authorization: Bearer {token}
{
  "walletId": "wallet-1",
  "categoryId": "food",
  "type": "expense",
  "amount": 45.50,
  "description": "Lunch",
  "date": "2025-01-20"
}
```

### 3. Fetch Dashboard Stats
```
GET /stats/overview?startDate=2025-01-01&endDate=2025-01-31
GET /stats/monthly?startDate=2024-11-01&endDate=2025-01-31
GET /stats/by-category?type=expense
Header: Authorization: Bearer {token}
```

### 4. Export Data
```
GET /transactions/export?format=csv&startDate=2025-01-01&endDate=2025-01-31
Header: Authorization: Bearer {token}
Returns: CSV file download
```

---

## API Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-20 | Initial API specification |

---

## Support and Contact

For API integration questions or issues:
- Email: api-support@spendwise.com
- Documentation: https://docs.spendwise.com
- Status Page: https://status.spendwise.com

---

**End of API Specification**
