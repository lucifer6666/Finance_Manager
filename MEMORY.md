# Finance Manager - Project Memory & Development Log

## Project Overview
A full-stack personal finance management application built with React + FastAPI for tracking transactions, credit cards, and investments with recurring auto-entry support.

**Current Date**: December 27, 2025

## Session History

### Session 1: Initial Development
- Created basic project structure
- Set up React + TypeScript frontend with Tailwind CSS
- Set up FastAPI backend with SQLAlchemy ORM
- Implemented basic transaction and credit card management

### Session 2: Bug Fixes & Styling
- Fixed savings page loading issue
- Fixed route ordering in savings router (moved `/comparison/current` before `/{investment_id}`)
- Updated text colors across entire app (black labels for visibility)
- Changed form inputs to white text on gray-700 background
- Fixed database schema mismatch (added missing `purchase_date` column)

### Session 3: Recurring Investments Feature (Current)
- Added recurring investment support to database schema
- Implemented auto-entry functionality for monthly/yearly contributions
- Updated frontend form with recurring options
- Enhanced database initialization to preserve existing data
- Created comprehensive documentation
**Backend:**
- FastAPI 0.104.1 - REST API framework
- SQLAlchemy 2.0.23 - ORM for database operations
- SQLite - Local database
- Pydantic 2.5.0 - Data validation
- Python 3.x

**Frontend:**
- React 18.2.0 - UI framework
- Vite 7.3.0 - Build tool
- TypeScript 5.2.2 - Type safety
- Tailwind CSS 3.3.6 - Styling
- Recharts 2.10.3 - Data visualization
- Axios 1.6.2 - HTTP client

## Project Structure
```
Finance_Manager/
├── backend/
│   ├── app/
│   │   ├── main.py - FastAPI app initialization
│   │   ├── database.py - SQLAlchemy setup
│   │   ├── models.py - ORM models (Transaction, CreditCard, SavingsInvestment)
│   │   ├── schemas.py - Pydantic validation schemas
│   │   ├── crud.py - Database CRUD operations
│   │   ├── routers/
│   │   │   ├── transactions.py
│   │   │   ├── cards.py
│   │   │   ├── analytics.py
│   │   │   └── savings.py
│   │   └── utils/
│   │       └── analytics.py - Calculation functions
│   ├── requirements.txt
│   └── finance_manager.db (auto-created)
└── frontend/
    ├── src/
    │   ├── pages/ - React page components
    │   ├── components/ - Reusable components
    │   ├── services/ - API service layer
    │   ├── App.tsx - Main app component
    │   └── index.css - Global styles
    └── package.json
```

## Database Models

### Transaction
- `id` (Integer, Primary Key)
- `date` (Date)
- `amount` (Float)
- `type` (String: "income" or "expense")
- `category` (String)
- `description` (String, nullable)
- `payment_method` (String: "cash", "card", "upi", "bank")
- `credit_card_id` (Foreign Key, nullable)
- `created_at` (DateTime)

### CreditCard
- `id` (Integer, Primary Key)
- `name` (String)
- `bank_name` (String)
- `billing_cycle_start` (Integer: day of month)
- `billing_cycle_end` (Integer: day of month)
- `due_date` (Integer: day of month)
- `credit_limit` (Float)
- `created_at` (DateTime)

### SavingsInvestment
- `id` (Integer, Primary Key)
- `name` (String)
- `investment_type` (String: "mutual_fund", "life_insurance", "fixed_deposit", "stock", "crypto", "other")
- `purchase_date` (Date) ⭐ **CRITICAL: This column was missing - now added**
- `initial_amount` (Float)
- `current_value` (Float)
- `description` (String, nullable)
- `created_at` (DateTime)
- `updated_at` (DateTime)

## API Endpoints

### Transactions (`/api/transactions`)
- `GET /` - List all transactions
- `POST /` - Create transaction
- `GET /{id}` - Get transaction by ID
- `PUT /{id}` - Update transaction
- `DELETE /{id}` - Delete transaction

### Credit Cards (`/api/cards`)
- `GET /` - List all credit cards
- `POST /` - Create credit card
- `GET /{id}` - Get card by ID
- `PUT /{id}` - Update card
- `DELETE /{id}` - Delete card
- `GET /{id}/billing` - Get billing cycle info

### Savings/Investments (`/api/savings`)
- `GET /` - List all investments
- `POST /` - Create investment
- `GET /comparison/current` - Get savings vs investment comparison
- `GET /{id}` - Get investment by ID
- `PUT /{id}` - Update investment
- `DELETE /{id}` - Delete investment

### Analytics (`/api/analytics`)
- `GET /monthly` - Get monthly transaction summary
- `GET /yearly` - Get yearly transaction summary
- `GET /category` - Get category breakdown

## Known Issues Fixed

### ✅ December Date Calculation Bug (FIXED)
**Issue:** In `app/utils/analytics.py`, date arithmetic for next month failed in December
```python
# BUGGY: Tried to create date(year, 13, 1) in December
date(now.year, now.month + 1 if now.month < 12 else 1, 1)

# FIXED: Properly handles year rollover
if now.month == 12:
    current_month_end = date(now.year + 1, 1, 1)
else:
    current_month_end = date(now.year, now.month + 1, 1)
```

### ✅ Route Ordering in Savings Router (FIXED)
**Issue:** Endpoint `/comparison/current` was after `/{investment_id}`, so `current` was treated as an ID
**Fix:** Moved `/comparison/current` before `/{investment_id}` to fix pattern matching

### ✅ Database Schema Mismatch (FIXED)
**Issue:** `purchase_date` column was missing from `savings_investments` table
**Fix:** Deleted old database file - recreated with correct schema on startup

### ✅ UI/UX Improvements (FIXED)
- Text colors changed to black for visibility
- Form inputs styled with white text on gray-700 background
- Loading/error states improved in SavingsPage

## UI/UX Styling

### Form Elements
- Input background: `bg-gray-700`
- Input text color: `text-white`
- Labels: `text-black font-bold`
- Buttons: `bg-gray-600 hover:bg-gray-700`

### Pages Updated
- TransactionsPage - Text color fixed
- CreditCardsPage - Form styling updated
- SavingsPage - Loading/error states improved
- AnalyticsPage - Color scheme updated
- AddTransactionForm - Input colors fixed
- AddSavingsForm - Input colors fixed

## How to Run

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
Runs on: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on: `http://localhost:5173` (default Vite port)

## Important Notes

1. **Database**: SQLite file created automatically on first run (`finance_manager.db`)
2. **CORS**: Backend allows requests from `http://localhost:5173` (frontend)
3. **Date Handling**: All dates use Python `date` objects, stored as ISO format in SQLite
4. **Transaction Types**: Only "income" or "expense" are valid
5. **Investment Types**: mutual_fund, life_insurance, fixed_deposit, stock, crypto, or other
6. **Payment Methods**: cash, card, upi, or bank

## Current Date Context
- Application developed/fixed on: December 27, 2025
- This is important for date calculation logic testing

## Next Steps / Future Enhancements
- [ ] Add authentication/user management
- [ ] Add data export to CSV/Excel
- [ ] Add recurring transaction templates
- [ ] Add investment performance charts
- [ ] Add budget alerts/notifications
- [ ] Add data backup functionality
- [ ] Add date-range filtering for reports
- [ ] Add tax report generation
- [ ] Add goal tracking for savings targets
- [ ] Add multi-currency support

## Important Commands

### Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Initialize database with new schema (preserves data)
python init_db.py

# Run development server
python -m uvicorn app.main:app --reload

# Run with specific host/port
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development Workflow

1. **Start Backend**: `python -m uvicorn app.main:app --reload`
2. **Start Frontend**: `npm run dev`
3. **Access App**: Open `http://localhost:5173`
4. **View API Docs**: `http://localhost:8000/docs`
5. **Make Changes**: Edit files - hot reload enabled in both servers

## Database Initialization

The `init_db.py` script now intelligently handles database setup:

1. **If database doesn't exist**: Creates fresh schema
2. **If database exists**: 
   - Checks for missing columns
   - Adds new columns without deleting data
   - Preserves all existing records
   - Reports what was added/updated

This ensures safe schema migrations without data loss.

## Recent Changes (December 27, 2025)

### New Recurring Investment Fields
Added to `SavingsInvestment` model:
- `is_recurring` (Integer: 0 or 1)
- `recurring_type` (String: "monthly" or "yearly")
- `recurring_amount` (Float: amount to add per period)
- `last_recurring_date` (Date: tracks last auto-entry)

### New CRUD Function
```python
process_recurring_investments(db: Session) -> int
```
- Processes all recurring investments daily
- Adds `recurring_amount` to `current_value`
- Updates `last_recurring_date`
- Returns count of processed investments

### New API Endpoint
```
POST /api/savings/process/recurring
Response: {"message": "Processed X recurring investments"}
```

### Updated Frontend Form
- Added checkbox to enable recurring
- Added frequency selector (Monthly/Yearly)
- Added recurring amount input
- Shows conditional UI based on recurring toggle

## Troubleshooting

### Backend Won't Start
1. Check Python version: `python --version` (need 3.8+)
2. Install dependencies: `pip install -r requirements.txt`
3. Initialize database: `python init_db.py`
4. Check port 8000 is available

### Frontend Won't Start
1. Check Node version: `node --version` (need 16+)
2. Install dependencies: `npm install`
3. Check port 5173 is available
4. Clear cache: `npm cache clean --force`

### Database Errors
1. Delete old database: `rm backend/finance_manager.db`
2. Re-initialize: `python backend/init_db.py`
3. Or let app auto-create on startup

### CORS Errors
- Backend CORS is configured for `http://localhost:5173`
- If frontend runs on different port, update `app/main.py` CORS origins

## Code Style Guidelines

### Python (Backend)
- Use type hints for all functions
- Follow PEP 8 conventions
- Use docstrings for functions
- Import from app modules for clarity

### TypeScript (Frontend)
- Use strict mode enabled
- Define interfaces for all data structures
- Use functional components with hooks
- Use descriptive variable names

### CSS/Tailwind
- Use Tailwind utility classes
- Avoid inline styles
- Use consistent color palette
- Maintain responsive design

## Important Files & Their Purpose

### Backend Core
- `app/main.py` - FastAPI initialization, CORS, router registration
- `app/database.py` - SQLAlchemy engine and session factory
- `app/models.py` - ORM models for all entities
- `app/schemas.py` - Pydantic validation schemas
- `app/crud.py` - Database CRUD operations

### Backend Routers
- `app/routers/transactions.py` - Transaction endpoints
- `app/routers/cards.py` - Credit card endpoints  
- `app/routers/savings.py` - Investment endpoints
- `app/routers/analytics.py` - Analytics endpoints

### Frontend Components
- `pages/TransactionsPage.tsx` - Transaction management UI
- `pages/CreditCardsPage.tsx` - Credit card management UI
- `pages/SavingsPage.tsx` - Investment portfolio UI
- `pages/AnalyticsPage.tsx` - Financial insights UI
- `components/AddSavingsForm.tsx` - Investment form with recurring support
- `services/api.ts` - Centralized API calls

## Architecture Notes

### API Design
- RESTful endpoints following standard conventions
- Consistent error responses with status codes
- Automatic input validation via Pydantic
- Interactive docs at `/docs` (Swagger UI)

### Database
- SQLite for simplicity (can migrate to PostgreSQL)
- Foreign keys for referential integrity
- Timestamps for audit trails
- Nullable fields for optional data

### Frontend
- React hooks for state management
- Axios for HTTP requests
- Tailwind for responsive design
- TypeScript for type safety

## Performance Considerations

1. **Database**: Consider indexing on frequently queried columns
2. **API**: Implement pagination for large result sets
3. **Frontend**: Use React.memo for expensive components
4. **Caching**: Add caching headers to static assets

## Security Notes

1. CORS restricted to localhost (update for production)
2. No authentication currently (add before production)
3. All inputs validated via Pydantic
4. SQL injection protected via SQLAlchemy ORM
5. Should add rate limiting before public release

## Testing (Future)

Recommended testing strategy:
- Unit tests for CRUD operations
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for user workflows

Use pytest (backend) and Vitest/Jest (frontend).
