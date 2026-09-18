# backend/src/schemas.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class WeatherResponse(BaseModel):
    city_name: str
    country: Optional[str] = None
    temp: float
    feels_like: float
    temp_min: float
    temp_max: float
    humidity: int
    description: str

    class Config:
        from_attributes = True

class WeatherLogDB(BaseModel):
    id: int
    city: str
    country: Optional[str] = None
    temperature: float
    feels_like: float
    humidity: int
    description: str
    created_at: datetime

    class Config:
        from_attributes = True