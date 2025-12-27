# 💰 Finance Manager

A full-stack personal finance management application for tracking transactions, credit cards, and investment portfolio with recurring investment support.

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

### Credit Card Management
- Track multiple credit cards
- Configure billing cycles and due dates
- Set credit limits
- View spending per card

### Investment Portfolio
- Record investments (Mutual Funds, Stocks, Life Insurance, Crypto, etc.)
- Track initial amount and current value
- Calculate profit/loss
- **NEW: Auto-entry for recurring investments**
  - Monthly recurring contributions
  - Yearly recurring contributions
  - Automatic value updates

### Analytics & Insights
- Monthly and yearly summaries
- Income vs expense breakdown
- Category-wise spending analysis
- Savings comparison (Account vs Investments)
- Investment performance tracking

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
│   │   ├── models.py            # ORM models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── crud.py              # Database operations
│   │   ├── routers/
│   │   │   ├── transactions.py  # Transaction endpoints
│   │   │   ├── cards.py         # Credit card endpoints
│   │   │   ├── analytics.py     # Analytics endpoints
│   │   │   └── savings.py       # Investment endpoints
│   │   └── utils/
│   │       └── analytics.py     # Calculation utilities
│   ├── requirements.txt
│   ├── init_db.py              # Database initialization
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
