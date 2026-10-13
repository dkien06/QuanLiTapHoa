from fastapi import FastAPI
from app.routers.auth import router as auth_router

app = FastAPI(title="Grocery Management API")

app.include_router(auth_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Hello World"}

