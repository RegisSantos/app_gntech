from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.database import engine, Base, get_db
import src.models as models

# Cria as tabelas automaticamente ao iniciar
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GnTech Weather API",
    description="API RESTful para extração, armazenamento e consulta de dados climáticos.",
    version="1.0.0"
)

@app.get("/", tags=["Healthcheck"])
def read_root():
    return {"message": "API GnTech está rodando perfeitamente!"}

@app.get("/health", tags=["Healthcheck"])
def health_check(db: Session = Depends(get_db)):
    try:
        # Testa a conexão com o banco de dados MySQL
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro de conexão com o banco de dados: {str(e)}")