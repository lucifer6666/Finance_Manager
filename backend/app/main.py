from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .routers import transactions, cards, analytics, savings, salary, payments, auth
from .utils.auto_increment import run_startup_checks

# Create all database tables
Base.metadata.create_all(bind=engine)

# Run startup checks for auto-increment entries
db = SessionLocal()
try:
    startup_check_results = run_startup_checks(db)
    print("\n" + "="*60)
    print("AUTO-INCREMENT STARTUP CHECKS")
    print("="*60)
    print(f"✓ Salary entries: {startup_check_results['salaries']['message']}")
    print(f"✓ Recurring investments: {startup_check_results['investments']['message']}")
    print(f"✓ Total auto-entries processed: {startup_check_results['all_processed']}")
    print("="*60 + "\n")
except Exception as e:
    print(f"⚠ Warning: Startup checks encountered an error: {e}")
finally:
    db.close()

# Initialize FastAPI app
app = FastAPI(
    title="Personal Finance Manager",
    description="A local-only web application to track income, expenses, and manage credit cards",
    version="1.0.0"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    transactions.router,
    prefix="/api/transactions",
    tags=["Transactions"]
)

app.include_router(
    cards.router,
    prefix="/api/cards",
    tags=["Credit Cards"]
)

app.include_router(
    analytics.router,
    prefix="/api/analytics",
    tags=["Analytics"]
)

app.include_router(
    savings.router,
    prefix="/api/savings",
    tags=["Savings & Investments"]
)

app.include_router(
    salary.router,
    prefix="/api/salaries",
    tags=["Salaries"]
)

app.include_router(
    payments.router,
    prefix="/api/payments",
    tags=["Credit Card Payments"]
)

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Authentication"]
)


@app.get("/", tags=["Health"])
def read_root():
    """Health check endpoint"""
    return {
        "message": "Personal Finance Manager API",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
