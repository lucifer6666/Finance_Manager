# 💰 Finance Manager

A full-stack personal finance management application for tracking transactions, credit cards, salary, and investment portfolio with recurring auto-entry support and advanced analytics.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python init_db.py
python -m uvicorn app.main:app --reload
```

Backend runs on: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 📋 Features

### Transaction Management
- Track income and expenses
- Categorize transactions
- Link transactions to credit cards
- Multiple payment methods (Cash, Card, UPI, Bank)

### Salary Management (NEW)
- Set up recurring monthly salary
- Automatic entry on 1st of each month
- Edit/update salary amount anytime
- Toggle active/inactive status
- Track salary history with last added date

### Credit Card Management
- Track multiple credit cards
- Configure billing cycles and due dates
- Set credit limits
- View spending per card

### Investment Portfolio
- Record investments (Mutual Funds, Stocks, Life Insurance, Crypto, etc.)
- Track initial amount and current value
- Calculate profit/loss
- Auto-entry for recurring investments
  - Monthly recurring contributions
  - Yearly recurring contributions (divided by 12 for monthly calculation)
  - Automatic value updates

### Analytics & Insights
- **Dashboard**: Quick overview with income, expense, investments, and savings
- **Spending Trends**: 12-month trend analysis with monthly breakdown
- **Monthly Analysis**: Deep-dive into specific months with:
  - Income, Expense, Investments, and Savings breakdown
  - Category-wise expense distribution
  - Pie charts for visual analysis
  - AI-generated insights and recommendations
- **Category Analysis**: 
  - Expense categories with percentages
  - Investments shown as a category
  - Top spending categories highlighted
- **Yearly Summaries**: Full year overview with monthly breakdowns

## 🏗️ Technology Stack

### Backend
- **FastAPI 0.104.1** - REST API framework
- **SQLAlchemy 2.0.23** - ORM for database
- **SQLite** - Local database
- **Pydantic 2.5.0** - Data validation
- **Python 3.x** - Server-side language

### Frontend
- **React 18.2.0** - UI library
- **Vite 7.3.0** - Build tool & dev server
- **TypeScript 5.2.2** - Type safety
- **Tailwind CSS 3.3.6** - Utility-first styling
- **Recharts 2.10.3** - Data visualization
- **Axios 1.6.2** - HTTP client

## 📁 Project Structure

```
Finance_Manager/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app setup
│   │   ├── database.py          # SQLAlchemy configuration
│   │   ├── models.py            # ORM models (Transaction, CreditCard, SavingsInvestment, Salary)
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── crud.py              # Database operations
│   │   ├── routers/
│   │   │   ├── transactions.py  # Transaction endpoints
│   │   │   ├── cards.py         # Credit card endpoints
│   │   │   ├── analytics.py     # Analytics endpoints
│   │   │   ├── savings.py       # Investment endpoints
│   │   │   └── salary.py        # Salary endpoints (NEW)
│   │   └── utils/
│   │       └── analytics.py     # Calculation utilities (updated for investments)
│   ├── requirements.txt
│   ├── init_db.py              # Database initialization
│   └── finance_manager.db      # SQLite database (auto-created)
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.tsx         # Main dashboard
    │   │   ├── TransactionsPage.tsx  # Transaction management
    │   │   ├── CreditCardsPage.tsx   # Credit card management
    │   │   ├── SavingsPage.tsx       # Investment portfolio
    │   │   ├── SalaryPage.tsx        # Salary management (NEW)
    │   │   ├── AnalyticsPage.tsx     # Advanced analytics with monthly analysis
    │   │   └── index.ts
    │   ├── components/
    │   │   ├── AddTransactionForm.tsx
    │   │   ├── AddSavingsForm.tsx
    │   │   ├── SalaryManagement.tsx   # Salary UI component (NEW)
    │   │   ├── CategoryPieChart.tsx
    │   │   ├── MonthlyChart.tsx
    │   │   ├── CreditCardSummary.tsx
    │   │   ├── TransactionTable.tsx
    │   │   ├── SavingsInvestmentTable.tsx
    │   │   ├── InsightPanel.tsx
    │   │   └── Navbar.tsx
    │   ├── hooks/
    │   │   ├── useTransactions.ts
    │   │   ├── useCreditCards.ts
    │   │   ├── useSavings.ts
    │   │   ├── useAnalytics.ts
    │   │   └── useSalaries.ts         # Salary management hook (NEW)
    │   ├── api/
    │   │   └── client.ts             # API client with salary endpoints (updated)
    │   ├── types/
    │   │   └── index.ts              # TypeScript type definitions
    │   ├── App.tsx                   # Main app with routing
    │   └── index.css
    ├── package.json
    └── vite.config.ts
```

## 📊 Key Features Explained

### Salary Auto-Entry System
- Create salary entries with:
  - **Name**: Salary identifier (e.g., "Primary Salary", "Bonus")
  - **Monthly Amount**: The recurring amount
  - **Start Date**: When the salary was initialized (NEW - Session 5)
  - **Active Status**: Toggle to enable/disable auto-entry
  - **Description**: Optional notes
- System automatically creates income transactions on 1st of month
- Salaries appear in Analytics and Dashboard
- Can be toggled active/inactive to pause auto-entry
- Track salary history with "Started" and "Last Added" dates

### Investment Calculation Logic
- **Non-recurring investments**: Counted only in purchase month
- **Monthly recurring**: Full amount counted each month
- **Yearly recurring**: Divided by 12 and counted as monthly equivalent
- **In Analytics**: Investments display separately AND as a category in breakdowns

### Monthly Analysis Page
- Toggle between "Spending Trends" (12-month) and "Monthly Analysis" (deep-dive)
- Monthly Analysis includes:
  - Summary cards showing Income, Expense, Investments, Savings, and Savings Rate
  - Category distribution pie chart
  - Detailed category breakdown with amounts and percentages
  - AI-generated insights based on spending patterns

## 🔄 Data Flow

```
Frontend (React + TypeScript)
    ↓ (HTTP with Axios)
API Routes (FastAPI routers)
    ↓
Business Logic (CRUD operations)
    ↓
Database (SQLite with SQLAlchemy ORM)
    ↓
Analytics Utils (Calculate summaries and insights)
```

## 🚦 Running the Application

### Development Mode

Terminal 1 (Backend):
```bash
cd backend
python -m uvicorn app.main:app --reload
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173` in your browser.

### API Documentation
Once backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## 📈 Current Statistics

- **Models**: 4 (Transaction, CreditCard, SavingsInvestment, Salary)
- **API Endpoints**: 30+ endpoints across 5 routers
- **Pages**: 6 (Dashboard, Transactions, Cards, Savings, Analytics, Salary)
- **Components**: 15+ reusable React components
- **Hooks**: 5 custom React hooks for data management

## 🐛 Known Issues & Fixes

### ✅ Fixed Issues
- December date calculation bug (year rollover)
- Route ordering in savings router
- Database schema mismatch (purchase_date column)
- Pydantic validation for top_categories
- Investment calculation to prevent double-counting
- Dashboard crashes when investments present

## 🔒 Security Notes

1. **CORS**: Currently allows all origins (update for production)
2. **Authentication**: Not implemented (add before production)
3. **Input Validation**: All inputs validated via Pydantic
4. **SQL Injection**: Protected via SQLAlchemy ORM
5. **Rate Limiting**: Not implemented (add before public release)

## 🔮 Future Enhancements

- [ ] User authentication and multi-user support
- [ ] Data export to CSV/Excel
- [ ] Budget alerts and notifications
- [ ] Tax report generation
- [ ] Multi-currency support
- [ ] Investment goal tracking
- [ ] Recurring expense templates
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Advanced filtering and search
- [ ] Data backup and restore functionality

## 📝 Important Notes

1. **Database**: SQLite file created automatically in backend folder
2. **CORS**: Configure for production use
3. **Hot Reload**: Both frontend and backend support hot reload in dev mode
4. **Date Format**: All dates stored as ISO format (YYYY-MM-DD)
5. **Investment Logic**: Yearly recurring investments are smart-calculated as monthly equivalent
6. **Salary Processing**: Happens daily, but only processes on 1st of month

## 🤝 Contributing

When adding new features:
1. Update both backend and frontend simultaneously
2. Update MEMORY.md with session notes
3. Update README.md with new features
4. Test thoroughly with sample data
5. Keep TypeScript and Python type hints strict

## 📞 Support

For issues or questions about the application, refer to the API documentation at `/docs` endpoint when backend is running.
│   └── finance.db              # SQLite database (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── services/           # API service layer
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx             # Main app component
│   │   └── index.css           # Global styles
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
│
├── MEMORY.md                   # Development memory & notes
├── README.md                   # This file
├── .gitignore                  # Git ignore patterns
└── README.TXT                  # Original readme
```

## 🗄️ Database Schema

### Transaction
```
- id (Primary Key)
- date (Date)
- amount (Float)
- type (income | expense)
- category (String)
- description (Optional)
- payment_method (cash | card | upi | bank)
- credit_card_id (Foreign Key, Optional)
- created_at (DateTime)
```

### CreditCard
```
- id (Primary Key)
- name (String)
- bank_name (String)
- billing_cycle_start (Day of month)
- billing_cycle_end (Day of month)
- due_date (Day of month)
- credit_limit (Float)
- created_at (DateTime)
- transactions (Relationship)
```

### SavingsInvestment
```
- id (Primary Key)
- name (String)
- investment_type (mutual_fund | life_insurance | fixed_deposit | stock | crypto | other)
- purchase_date (Date)
- initial_amount (Float)
- current_value (Float)
- description (Optional)
- is_recurring (Boolean)
- recurring_type (monthly | yearly | null)
- recurring_amount (Float, Optional)
- last_recurring_date (Date, Optional)
- created_at (DateTime)
- updated_at (DateTime)
```

## 🔌 API Endpoints

### Transactions
```
GET    /api/transactions              # List all
POST   /api/transactions              # Create
GET    /api/transactions/{id}         # Get by ID
PUT    /api/transactions/{id}         # Update
DELETE /api/transactions/{id}         # Delete
```

### Credit Cards
```
GET    /api/cards                     # List all
POST   /api/cards                     # Create
GET    /api/cards/{id}                # Get by ID
PUT    /api/cards/{id}                # Update
DELETE /api/cards/{id}                # Delete
GET    /api/cards/{id}/billing        # Billing info
```

### Investments
```
GET    /api/savings                   # List all investments
POST   /api/savings                   # Create investment
GET    /api/savings/comparison/current # Investment vs account comparison
GET    /api/savings/{id}              # Get by ID
PUT    /api/savings/{id}              # Update investment
DELETE /api/savings/{id}              # Delete investment
POST   /api/savings/process/recurring # Process recurring investments
```

### Analytics
```
GET    /api/analytics/monthly         # Monthly summary
GET    /api/analytics/yearly          # Yearly summary
GET    /api/analytics/category        # Category breakdown
```

## 🎨 UI Components

### Pages
- **TransactionsPage** - Manage transactions with filters
- **CreditCardsPage** - Manage credit cards and billing
- **SavingsPage** - View investments and portfolio performance
- **AnalyticsPage** - View financial insights and charts

### Forms
- **AddTransactionForm** - Record income/expenses
- **AddSavingsForm** - Add investments (with recurring options)
- **AddCreditCardForm** - Register credit cards

### Components
- Dashboard - Overview of finances
- Charts - Visualization using Recharts
- Loading states - Spinner for async operations
- Error handling - User-friendly error messages

## 📝 Styling

### Color Scheme
- **Primary**: Blue-600 (#2563EB)
- **Secondary**: Gray-700 (#374151)
- **Text**: Black for labels, White for inputs
- **Background**: White pages, Gray-700 for form inputs
- **Accents**: Green for profit, Red for loss

### Typography
- **Headings**: Bold, Black text
- **Labels**: Small, Bold, Black text
- **Inputs**: White text on Gray-700 background
- **Buttons**: Blue with hover effects

## 🔧 Configuration

### Backend (.env)
```
DATABASE_URL=sqlite:///./finance_manager.db
```

### CORS Settings
- Allowed origins: `http://localhost:5173`
- Methods: GET, POST, PUT, DELETE
- Credentials: Enabled

## 🐛 Known Issues & Fixes

### ✅ December Date Calculation Bug (FIXED)
Date arithmetic for next month now properly handles year boundary.

### ✅ Route Ordering (FIXED)
Endpoint `/comparison/current` moved before `/{investment_id}` for correct matching.

### ✅ Database Schema Mismatch (FIXED)
Added missing `purchase_date` column to investments table.

### ✅ Data Preservation (FIXED)
Database initialization now preserves existing data while adding new columns.

## 📊 Recurring Investments

### How It Works
1. **Enable Recurring**: Check "Set up auto-entry" when creating/updating investment
2. **Set Frequency**: Choose Monthly or Yearly
3. **Set Amount**: Enter recurring contribution amount
4. **Auto-Update**: System automatically updates `current_value` on schedule
5. **Track**: `last_recurring_date` tracks when last update occurred

### API Usage
```bash
# Process all recurring investments
POST http://localhost:8000/api/savings/process/recurring
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Docker Support (Optional)
```bash
docker-compose up -d
```

## 📚 Development Notes

- All dates use ISO format (YYYY-MM-DD)
- API responses include timestamps in ISO 8601 format
- Validation errors return 422 Unprocessable Entity
- Not found errors return 404
- Server errors return 500 with error message

## 🤝 Contributing

1. Create a branch for your feature
2. Make changes following the existing code style
3. Test thoroughly
4. Update MEMORY.md with important notes
5. Commit with clear messages

## 📄 License

Private project - Finance Manager

## 📞 Support

For issues or questions, refer to MEMORY.md for development context and troubleshooting.
