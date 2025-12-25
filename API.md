# SpendWise API Documentation

Complete REST API reference for the SpendWise application.

## Base URL
```
http://localhost:8080/api
```

## Content Type
All requests and responses use `application/json`

---

## Authentication

Currently using JWT bearer tokens (demo implementation). For production, upgrade with:
- Real user authentication
- Token refresh endpoints
- Secure HTTP-only cookies

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Endpoints

### Transactions

#### List Transactions
```http
GET /transactions?startDate=2024-01-01&endDate=2024-12-31&categoryId=food
```

**Query Parameters:**
- `startDate` (string, ISO date) - Filter from date
- `endDate` (string, ISO date) - Filter to date
- `categoryId` (string) - Filter by category

**Response:** 200 OK
```json
{
  "transactions": [
    {
      "id": "1",
      "walletId": "default",
      "categoryId": "food",
      "type": "expense",
      "amount": 45.50,
      "description": "Lunch at restaurant",
      "date": "2024-01-15",
      "createdAt": "2024-01-15T12:30:00Z"
    }
  ],
  "summary": {
    "totalIncome": 5000,
    "totalExpense": 500,
    "balance": 4500,
    "byCategory": {
      "food": -150,
      "transport": -50
    }
  }
}
```

#### Create Transaction
```http
POST /transactions
Content-Type: application/json

{
  "walletId": "default",
  "categoryId": "food",
  "type": "expense",
  "amount": 25.99,
  "description": "Coffee and lunch",
  "date": "2024-01-15"
}
```

**Response:** 201 Created
```json
{
  "id": "123",
  "walletId": "default",
  "categoryId": "food",
  "type": "expense",
  "amount": 25.99,
  "description": "Coffee and lunch",
  "date": "2024-01-15",
  "createdAt": "2024-01-15T12:30:00Z"
}
```

#### Update Transaction
```http
PUT /transactions/:id
Content-Type: application/json

{
  "amount": 30.00,
  "description": "Coffee, lunch, and snacks"
}
```

**Response:** 200 OK
```json
{
  "id": "123",
  "walletId": "default",
  "categoryId": "food",
  "type": "expense",
  "amount": 30.00,
  "description": "Coffee, lunch, and snacks",
  "date": "2024-01-15",
  "createdAt": "2024-01-15T12:30:00Z"
}
```

#### Delete Transaction
```http
DELETE /transactions/:id
```

**Response:** 204 No Content

---

### Categories

#### List All Categories
```http
GET /categories
```

**Response:** 200 OK
```json
[
  {
    "id": "food",
    "name": "Food & Dining",
    "icon": "Utensils",
    "color": "bg-orange-500",
    "type": "expense"
  },
  {
    "id": "salary",
    "name": "Salary",
    "icon": "Briefcase",
    "color": "bg-blue-500",
    "type": "income"
  }
]
```

#### List Categories by Type
```http
GET /categories/type/expense
```

**Response:** 200 OK
```json
[
  {
    "id": "food",
    "name": "Food & Dining",
    "icon": "Utensils",
    "color": "bg-orange-500",
    "type": "expense"
  },
  {
    "id": "transport",
    "name": "Transport",
    "icon": "Car",
    "color": "bg-purple-500",
    "type": "expense"
  }
]
```

#### Create Category
```http
POST /categories
Content-Type: application/json

{
  "name": "Groceries",
  "icon": "ShoppingCart",
  "color": "bg-green-500",
  "type": "expense"
}
```

**Response:** 201 Created
```json
{
  "id": "groceries",
  "name": "Groceries",
  "icon": "ShoppingCart",
  "color": "bg-green-500",
  "type": "expense"
}
```

---

### Wallets

#### List Wallets
```http
GET /wallets
```

**Response:** 200 OK
```json
[
  {
    "id": "default",
    "name": "My Account",
    "type": "bank",
    "balance": 5000,
    "currency": "USD"
  },
  {
    "id": "cash",
    "name": "Cash Wallet",
    "type": "cash",
    "balance": 200,
    "currency": "USD"
  }
]
```

#### Create Wallet
```http
POST /wallets
Content-Type: application/json

{
  "name": "Savings Account",
  "type": "bank",
  "currency": "USD"
}
```

**Response:** 201 Created
```json
{
  "id": "savings",
  "name": "Savings Account",
  "type": "bank",
  "balance": 0,
  "currency": "USD"
}
```

#### Update Wallet
```http
PUT /wallets/:id
Content-Type: application/json

{
  "name": "Primary Account",
  "balance": 5500
}
```

**Response:** 200 OK
```json
{
  "id": "default",
  "name": "Primary Account",
  "type": "bank",
  "balance": 5500,
  "currency": "USD"
}
```

#### Delete Wallet
```http
DELETE /wallets/:id
```

**Response:** 204 No Content

---

### Summary

#### Get Financial Summary
```http
GET /summary
```

**Response:** 200 OK
```json
{
  "current": {
    "totalIncome": 5000,
    "totalExpense": 500,
    "balance": 4500,
    "byCategory": {
      "salary": 5000,
      "food": -150,
      "transport": -50,
      "shopping": -300
    }
  },
  "monthly": [
    {
      "month": "2024-01",
      "income": 5000,
      "expense": 200,
      "balance": 4800
    },
    {
      "month": "2024-02",
      "income": 0,
      "expense": 300,
      "balance": -300
    }
  ]
}
```

---

## Data Types

### Transaction
```typescript
interface Transaction {
  id: string;
  walletId: string;
  categoryId: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;              // ISO date format: YYYY-MM-DD
  receiptImage?: string;
  createdAt: string;         // ISO datetime
}
```

### Category
```typescript
interface Category {
  id: string;
  name: string;
  icon: string;              // Lucide React icon name
  color: string;             // TailwindCSS color class
  type: "income" | "expense";
}
```

### Wallet
```typescript
interface Wallet {
  id: string;
  name: string;
  type: "cash" | "bank" | "e-wallet";
  balance: number;
  currency: string;
}
```

### Summary
```typescript
interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: Record<string, number>;
}

interface MonthlySummary {
  month: string;            // YYYY-MM format
  income: number;
  expense: number;
  balance: number;
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": "Error message description"
}
```

### Status Codes
- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Example Error Response
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Missing required fields"
}
```

---

## Example Usage

### cURL

**Get Transactions**
```bash
curl -X GET "http://localhost:8080/api/transactions?categoryId=food" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>"
```

**Create Transaction**
```bash
curl -X POST "http://localhost:8080/api/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "walletId": "default",
    "categoryId": "food",
    "type": "expense",
    "amount": 25.99,
    "description": "Lunch",
    "date": "2024-01-15"
  }'
```

### JavaScript/Fetch

```javascript
// Get transactions
const response = await fetch('/api/transactions?categoryId=food', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// Create transaction
const createResponse = await fetch('/api/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    walletId: 'default',
    categoryId: 'food',
    type: 'expense',
    amount: 25.99,
    description: 'Lunch',
    date: '2024-01-15'
  })
});
const newTransaction = await createResponse.json();
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, add:
- Rate limiting middleware (express-rate-limit)
- Request throttling per IP
- Quota management per user

---

## Versioning

API is currently at **v1** (implicit). Future versions will use:
```
/api/v2/transactions
/api/v2/categories
```

---

## Future Enhancements

- [ ] Pagination for large datasets
- [ ] Bulk operations (batch create/delete)
- [ ] Advanced filtering (amount ranges, text search)
- [ ] Webhook support for integrations
- [ ] GraphQL endpoint
- [ ] WebSocket for real-time updates
- [ ] API key authentication
