from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import transactions, cards, analytics, savings

# Create all database tables
Base.metadata.create_all(bind=engine)

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
