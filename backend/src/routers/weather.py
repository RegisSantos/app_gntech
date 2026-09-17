from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src import models, schemas
from src.services.weather import fetch_city_weather

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/search", response_model=schemas.WeatherResponse)
async def search_weather(city: str):
    data = await fetch_city_weather(city)
    if not data:
        raise HTTPException(status_code=404, detail="Cidade não encontrada")
    return data

@router.post("/save", response_model=schemas.WeatherLogDB, status_code=201)
async def save_weather(city: str, db: Session = Depends(get_db)):
    weather_data = await fetch_city_weather(city)
    if not weather_data:
        raise HTTPException(status_code=404, detail="Cidade não encontrada")

    db_log = models.WeatherLog(
        city=weather_data.get("city_name"),
        country=weather_data.get("country"),
        temperature=weather_data.get("temp"),
        feels_like=weather_data.get("feels_like"),
        humidity=weather_data.get("humidity"),
        description=weather_data.get("description")
    )

    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/history", response_model=list[schemas.WeatherLogDB])
def get_weather_history(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    logs = db.query(models.WeatherLog).order_by(models.WeatherLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs