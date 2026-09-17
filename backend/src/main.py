from fastapi import FastAPI
from src.database import engine, Base
from src.routers import weather
import src.models

# Cria as tabelas automaticamente na inicialização
Base.metadata.create_all(bind=engine)

app = FastAPI(title="GnTech Weather API")

app.include_router(weather.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}