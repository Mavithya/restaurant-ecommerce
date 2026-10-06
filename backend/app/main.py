from fastapi import FastAPI
from sqlalchemy import text

from app.db.database import engine

app = FastAPI(
    title="Restaurant E-Commerce API",
    version="1.0.0",
)


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