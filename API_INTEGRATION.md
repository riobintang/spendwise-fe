# SpendWise Frontend API Integration

This document describes how the SpendWise frontend integrates with the backend API.

## Configuration

The API base URL is configured via environment variable:

```bash
VITE_PUBLIC_API_URL=http://localhost:8080
```

Create a `.env` file in the project root (use `.env.example` as template):

```bash
cp .env.example .env
```

## API Service

The main API service is located at `client/services/api.ts`. It provides functions for all backend endpoints.

### Authentication Flow

1. **Register**: Creates a new user account and automatically logs them in
2. **Login**: Returns JWT token and user information
3. **Token Storage**: Stored in localStorage via `utils/auth.ts`
4. **Protected Requests**: Token automatically added to Authorization header

### Response Format

All backend responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}
```

### Data Conversion

The frontend uses string IDs while the backend uses numeric IDs. The API service handles conversion automatically:

- **Backend → Frontend**: Converts numeric IDs to strings, decimal strings to numbers
- **Frontend → Backend**: Converts string IDs to numbers

## Available API Functions

### Authentication

```typescript
import { login, register } from '@/services/api';

// Login
const { token, user } = await login(email, password);

// Register
const { token, user } = await register(email, password, name);
```

### Transactions

```typescript
import { 
  getTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction 
} from '@/services/api';

// Get transactions with optional filters
const { transactions, summary } = await getTransactions(
  startDate,  // optional: YYYY-MM-DD
  endDate,    // optional: YYYY-MM-DD
  categoryId  // optional: string
);

// Create transaction
const transaction = await createTransaction({
  walletId: "1",
  categoryId: "2",
  type: TransactionType.EXPENSE,
  amount: 50000,
  description: "Lunch",
  date: "2025-12-22"
});

// Update transaction
const updated = await updateTransaction("1", {
  amount: 75000,
  description: "Updated lunch"
});

// Delete transaction
await deleteTransaction("1");
```

### Categories

```typescript
import { 
  getCategories, 
  getCategory,
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '@/services/api';

// Get all categories
const categories = await getCategories();

// Get categories by type
const expenseCategories = await getCategories("expense");

// Get single category
const category = await getCategory("1");

// Create category
const category = await createCategory({
  name: "Food",
  icon: "🍔",
  color: "#FF5722",
  type: TransactionType.EXPENSE
});

// Update category
const updated = await updateCategory("1", {
  name: "Updated Food"
});

// Delete category
await deleteCategory("1");
```

### Wallets

```typescript
import { 
  getWallets, 
  createWallet, 
  updateWallet, 
  deleteWallet 
} from '@/services/api';

// Get all wallets
const wallets = await getWallets();

// Get wallets by type
const cashWallets = await getWallets("cash");

// Create wallet
const wallet = await createWallet({
  name: "Main Wallet",
  type: "cash",
  currency: "IDR"
});

// Update wallet
const updated = await updateWallet("1", {
  name: "Updated Wallet",
  balance: 150000
});

// Delete wallet
await deleteWallet("1");
```

### Summary

```typescript
import { getSummary } from '@/services/api';

// Get financial summary
const { current, monthly } = await getSummary();

// current: { totalIncome, totalExpense, balance, byCategory }
// monthly: [{ month, income, expense, balance }, ...]
```

### Export

```typescript
import { exportTransactions } from '@/services/api';

// Export transactions
const { data, filename, mimeType } = await exportTransactions(
  "csv",           // format: "json" | "csv" | "excel"
  "2025-01-01",   // optional: startDate
  "2025-12-31"    // optional: endDate
);

// Download the file
const blob = new Blob([data], { type: mimeType });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.click();
```

## Error Handling

All API functions throw errors that can be caught and displayed:

```typescript
try {
  await createTransaction(data);
} catch (error) {
  const message = error instanceof Error 
    ? error.message 
    : "An error occurred";
  console.error(message);
  // Display error to user
}
```

## Authentication Guards

Protected routes use the `ProtectedRoute` component:

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route 
  path="/transactions" 
  element={
    <ProtectedRoute>
      <Transactions />
    </ProtectedRoute>
  } 
/>
```

## Using AuthContext

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Backend Requirements

The backend API must:

1. Run on `http://localhost:8080` (or configure VITE_PUBLIC_API_URL)
2. Accept JWT tokens in `Authorization: Bearer <token>` header
3. Return responses in the format specified above
4. Handle CORS for frontend origin

## Development Workflow

1. Start the backend server:
   ```bash
   # In backend directory
   npm run dev  # or your backend start command
   ```

2. Start the frontend:
   ```bash
   # In frontend directory
   pnpm dev
   ```

3. The frontend will connect to the backend API automatically

## Common Issues

### CORS Errors
- Ensure backend allows requests from `http://localhost:5173` (Vite dev server)
- Backend should include proper CORS headers

### 401 Unauthorized
- Token may be expired or invalid
- User should log in again
- Check Authorization header is being sent

### 404 Not Found
- Verify backend is running on correct port
- Check API_BASE_URL environment variable
- Ensure endpoint paths match backend routes

## Type Safety

The API service uses shared types from `@shared/api`:

```typescript
// Frontend and backend use the same types
import { 
  Transaction, 
  Category, 
  Wallet, 
  TransactionType 
} from '@shared/api';
```

This ensures type safety across the entire application.
