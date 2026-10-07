from fastapi import FastAPI
from sqlalchemy import text
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine , init_db
from app.routers import auth,admin,products,categories

app = FastAPI(
    title="Restaurant E-Commerce API",
    version="1.0.0",
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(products.router)
app.include_router(categories.router)


@app.get("/")
def root():
    return {
        "message": "Restaurant E-Commerce API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }

@app.get("/health/db")
def database_health_check():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "database": "connected"
    }