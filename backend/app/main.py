from fastapi import FastAPI

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