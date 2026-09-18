from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database import engine, Base
from src.routers import weather
import src.models

# Cria as tabelas automaticamente na inicialização
Base.metadata.create_all(bind=engine)

app = FastAPI(title="GnTech Weather API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}