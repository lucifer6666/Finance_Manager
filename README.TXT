1️⃣ High-Level Overview
Goal

Build a local-only web application to:

Track income and expenses

Manage credit card bills

View monthly and yearly analytics

Generate insights & recommendations

Run fully on localhost (no cloud dependency)

2️⃣ Tech Stack (Fixed)
Frontend

React (Vite)

TypeScript

Tailwind CSS

Recharts (for charts)

Axios (API calls)

Backend

FastAPI (Python)

SQLAlchemy ORM

SQLite (local DB)

Pydantic for validation

Architecture
finance-app/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
│   │   ├── routers/
│   │   │   ├── transactions.py
│   │   │   ├── categories.py
│   │   │   ├── cards.py
│   │   │   └── analytics.py
│   │   └── utils/
│   │       └── analytics.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── pages/
    │   ├── components/
    │   ├── hooks/
    │   ├── types/
    │   └── App.tsx
    └── package.json

3️⃣ Core Data Model (Very Important)
3.1 Transaction Table

Used for income + expenses

Transaction:
- id (int)
- date (date)
- amount (float)
- type ("income" | "expense")
- category (string)
- description (string)
- payment_method ("cash" | "card" | "upi" | "bank")
- credit_card_id (nullable)
- created_at

3.2 Credit Card Table
CreditCard:
- id
- name
- bank_name
- billing_cycle_start (int)  # day of month
- billing_cycle_end (int)
- due_date (int)
- credit_limit

3.3 Monthly Summary (Derived, not stored)

Computed dynamically.

MonthlySummary:
- month
- total_income
- total_expense
- savings
- top_categories

4️⃣ Backend – Step-by-Step Instructions
Step 1: Setup FastAPI
pip install fastapi uvicorn sqlalchemy pydantic


Create main.py:

from fastapi import FastAPI
from app.routers import transactions, cards, analytics

app = FastAPI(title="Personal Finance Manager")

app.include_router(transactions.router, prefix="/transactions")
app.include_router(cards.router, prefix="/cards")
app.include_router(analytics.router, prefix="/analytics")

Step 2: Database Setup

database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./finance.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

Step 3: Models

models.py

from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from .database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True)
    date = Column(Date)
    amount = Column(Float)
    type = Column(String)
    category = Column(String)
    description = Column(String)
    payment_method = Column(String)
    credit_card_id = Column(Integer, ForeignKey("credit_cards.id"))

class CreditCard(Base):
    __tablename__ = "credit_cards"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    bank_name = Column(String)
    billing_cycle_start = Column(Integer)
    billing_cycle_end = Column(Integer)
    due_date = Column(Integer)
    credit_limit = Column(Float)

Step 4: Core APIs
Transactions

POST /transactions

GET /transactions?month=YYYY-MM

DELETE /transactions/{id}

Credit Cards

POST /cards

GET /cards

Analytics

GET /analytics/monthly?month=YYYY-MM

GET /analytics/yearly?year=YYYY

GET /analytics/spending-trends

5️⃣ Analytics Logic (Core Intelligence)
Monthly Analytics Logic
def calculate_monthly_summary(transactions):
    income = sum(t.amount for t in transactions if t.type == "income")
    expense = sum(t.amount for t in transactions if t.type == "expense")

    category_map = {}
    for t in transactions:
        if t.type == "expense":
            category_map[t.category] = category_map.get(t.category, 0) + t.amount

    return {
        "total_income": income,
        "total_expense": expense,
        "savings": income - expense,
        "top_categories": sorted(category_map.items(), key=lambda x: x[1], reverse=True)
    }

6️⃣ Recommendation Engine (Simple Rules)

Examples:

If food > 30% of expenses → suggest budgeting

If credit card utilization > 70% → warning

If savings < 10% income → recommend reducing discretionary spend

def generate_insights(summary):
    insights = []

    if summary["total_expense"] > 0.9 * summary["total_income"]:
        insights.append("Your expenses are very close to your income.")

    if summary["savings"] < 0:
        insights.append("You are spending more than you earn.")

    return insights

7️⃣ Frontend Structure
Pages

/dashboard

/transactions

/credit-cards

/analytics

Components

AddTransactionForm

TransactionTable

MonthlyChart

CategoryPieChart

CreditCardSummary

InsightPanel

8️⃣ Charts (Recharts)

Line chart → Monthly income vs expense

Pie chart → Category distribution

Bar chart → Yearly trend

9️⃣ Running Locally
Backend
uvicorn app.main:app --reload

Frontend
npm install
npm run dev

🔮 Future Enhancements (Optional)

Import bank CSV statements

Budget limits per category

AI spending prediction

Recurring expenses

Multi-user login

Mobile app (React Native)