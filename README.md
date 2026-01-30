  # SpendWise - Smart Expense Management Application

A production-ready, full-stack expense tracking application built with React, TypeScript, Express, and modern web technologies. Track your income, expenses, analyze spending patterns, and export financial reports with ease. Spend smarter. Live better.

## 🌟 Features

### Core Features
- ✅ **Transaction Management** - Add, edit, and delete income and expense transactions
- ✅ **Smart Categories** - Organize transactions with customizable categories
- ✅ **Multi-Wallet Support** - Manage multiple accounts (cash, bank, e-wallet)
- ✅ **Automatic Balance Tracking** - Real-time balance calculation
- ✅ **Advanced Filtering** - Filter by date range and category
- ✅ **Financial Summaries** - Monthly and yearly transaction reports
- ✅ **Animated Charts** - Beautiful visualizations using Recharts
  - Income vs Expenses line chart
  - Category distribution pie chart
  - Monthly breakdown bar chart

### Advanced Features
- ✅ **OCR Receipt Scanning** - Scan receipts with automatic data extraction
- ✅ **Smart Insights** - AI-powered spending pattern analysis
  - Spending trend detection (month-over-month comparison)
  - Budget alerts (90% threshold notifications)
  - Personalized suggestions based on spending habits
- ✅ **Data Export** - Export transactions in multiple formats
  - Excel (.xlsx) with summary
  - JSON format
  - CSV format
- ✅ **Authentication** - Secure JWT-based authentication
- ✅ **Dark/Light Mode** - Theme switching support
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **TailwindCSS 3** - Styling
- **React Router 6** - Client-side routing
- **React Query** - Data fetching & caching
- **Recharts** - Data visualization
- **Radix UI** - Accessible component library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Icons

### Backend
- **Express.js** - REST API server
- **TypeScript** - Type-safe backend
- **In-Memory Storage** - Demo data (upgrade to PostgreSQL for production)
- **CORS** - Cross-origin request handling

### Development Tools
- **Vitest** - Testing framework
- **Prettier** - Code formatting
- **pnpm** - Fast package manager

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spendwise
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```
   The app will be available at `http://localhost:8080`

### Demo Credentials
```
Email: demo@example.com
Password: demo123
```

## 📁 Project Structure

```
spendwise/
├── client/                          # React frontend
│   ├── components/
│   │   ├── Header.tsx              # Global navigation header
│   │   ├── Layout.tsx              # Layout wrapper
│   │   ├── TransactionForm.tsx     # Add/edit transaction dialog
│   │   ├── TransactionTable.tsx    # Transactions list table
│   │   ├── ChartPanel.tsx          # Chart components (Income/Expense, Category, Breakdown)
│   │   ├── ReceiptScanner.tsx      # OCR receipt scanner
│   │   ├── ProtectedRoute.tsx      # Auth route protection
│   │   └── ui/                     # Radix UI components
│   ├── pages/
│   │   ├── Index.tsx               # Dashboard (home)
│   │   ├── Transactions.tsx        # Transactions page with filters
│   │   ├── Categories.tsx          # Categories management (placeholder)
│   │   ├── Wallets.tsx             # Wallets management (placeholder)
│   │   ├── Insights.tsx            # Smart insights dashboard
│   │   ├── Settings.tsx            # Settings & data export
│   │   ├── Login.tsx               # Login page
│   │   ├── Signup.tsx              # Sign up page
│   │   ├── NotFound.tsx            # 404 page
│   │   └── Placeholder.tsx         # Reusable placeholder
│   ├── context/
│   │   └── AuthContext.tsx         # Authentication context
│   ├── hooks/
│   │   ├── use-mobile.tsx          # Mobile detection hook
│   │   └── use-toast.ts            # Toast notification hook
│   ├── utils/
│   │   ├── auth.ts                 # Authentication utilities
│   │   ├── formatters.ts           # Date & currency formatting
│   │   ├── export.ts               # Excel/CSV export utilities
��   │   ├── insights.ts             # Spending pattern analysis engine
│   │   └── ocr.ts                  # OCR processing utilities
│   ├── App.tsx                     # App component with routing
│   ├── main.tsx                    # React entry point
│   ├── global.css                  # Global styles & theme variables
│   └── vite-env.d.ts              # Vite environment types
├── server/
│   ├── index.ts                    # Express server setup
│   ├── routes/
│   │   ├── transactions.ts         # Transaction endpoints
│   │   ├── categories.ts           # Category endpoints
│   │   ├── wallets.ts              # Wallet endpoints
│   │   └── summary.ts              # Summary endpoints
│   └── node-build.ts               # Production build config
├── shared/
│   └── api.ts                      # Shared types (client & server)
├── index.html                      # HTML entry point
├── package.json                    # Dependencies
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite configuration
└── README.md                       # This file
```

## 🔌 API Endpoints

### Transactions
- `GET /transactions` - List transactions (with optional filters: startDate, endDate, categoryId)
- `POST /transactions` - Create new transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

### Categories
- `GET /categories` - List all categories
- `GET /categories/type/:type` - List categories by type (income/expense)
- `POST /categories` - Create new category

### Wallets
- `GET /wallets` - List all wallets
- `POST /wallets` - Create new wallet
- `PUT /wallets/:id` - Update wallet
- `DELETE /wallets/:id` - Delete wallet

### Summary
- `GET /summary` - Get financial summary (current + monthly)

## 🎨 Theme System

The app supports light and dark modes with customizable colors:

### Color Variables
- **Primary**: Purple (262° 80% 50%) - Main brand color
- **Secondary**: Cyan (200° 100% 50%) - Accent color
- **Success**: Green (142° 76% 36%) - Income/positive
- **Destructive**: Red (0° 84.2% 60.2%) - Expenses/negative
- **Warning**: Orange (38° 92% 50%) - Alerts/warnings

Located in `client/global.css` and configured in `tailwind.config.ts`.

## 🔐 Authentication

The app uses JWT-based authentication with the following flow:

1. **Login/Signup** → User creates account or logs in
2. **Token Storage** → JWT token stored in localStorage
3. **Protected Routes** → `ProtectedRoute` wrapper checks auth status
4. **Automatic Redirect** → Unauthenticated users redirected to login

**Note**: Demo implementation uses simulated tokens. For production:
- Replace with real backend authentication
- Use secure HTTP-only cookies for tokens
- Implement proper password hashing (bcrypt)
- Add refresh token rotation

## 💡 Smart Insights Engine

The insights system analyzes spending patterns and provides:

### Pattern Detection
- **Month-over-month comparison** - Detects spending changes >30% increase/20% decrease
- **Budget alerts** - Notifies when spending reaches 75-90% of budget
- **Savings rate analysis** - Tracks savings as percentage of income

### Suggestion Types
- **Alerts** - High priority items (red)
- **Patterns** - Trend observations (yellow/orange)
- **Suggestions** - Actionable recommendations (blue)

## 📸 OCR Receipt Scanning

Receipt scanning features:

1. **Image Upload** - Upload receipt photo or take a picture
2. **Text Extraction** - Uses Tesseract.js (can integrate Google Vision API)
3. **Data Parsing** - Automatically extracts:
   - Merchant name
   - Total amount
   - Transaction date
4. **Auto-Fill** - Populates transaction form with extracted data
5. **Manual Review** - User can edit extracted data before saving

## 📊 Data Visualization

Charts auto-generated from transaction data:

- **Line Chart** - Income vs Expenses trend over months
- **Pie Chart** - Category distribution (spending breakdown)
- **Bar Chart** - Monthly expense breakdown

Uses Recharts with smooth animations and responsive sizing.

## 📤 Export Options

Export transactions in three formats:

- **Excel (.xlsx)** - With summary sheet and formatted data
- **JSON** - Complete transaction data
- **CSV** - Spreadsheet-compatible format

Export button in Settings page.

## 🧪 Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Code formatting
pnpm format.fix
```

## 🚀 Production Deployment

### Build
```bash
pnpm build
```

Creates optimized production bundles:
- `dist/spa/` - Frontend bundle
- `dist/server/` - Server bundle

### Deploy Options

#### Option 1: Netlify
```bash
# Connect your repo to Netlify
# Automatically builds and deploys
```

#### Option 2: Vercel
```bash
# Connect your repo to Vercel
# Automatically builds and deploys
```

#### Option 3: Self-Hosted
```bash
# Build locally
pnpm build

# Run production server
pnpm start

# Serve on your own infrastructure
```

## 📝 Configuration

### Environment Variables
Create `.env` file:
```env
# Optional: Custom API base URL
VITE_API_BASE_URL=http://localhost:8080

# Optional: App settings
VITE_APP_NAME=SpendWise
VITE_TIMEZONE=UTC
```

### Tailwind Configuration
Customize theme colors in `tailwind.config.ts` and CSS variables in `client/global.css`.

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.ts
server: {
  port: 3000  // Change to available port
}
```

### Dark Mode Not Working
Clear localStorage and browser cache:
```javascript
localStorage.clear()
```

### OCR Not Working
Tesseract.js requires proper script loading. Check:
- Network tab for CDN failures
- Browser console for errors
- Disable browser extensions that block scripts

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [Recharts](https://recharts.org)
- [React Query](https://tanstack.com/query)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues, questions, or suggestions, please open an GitHub issue or contact the development team.

---

**Built with ❤️ using React, TypeScript, and TailwindCSS**
