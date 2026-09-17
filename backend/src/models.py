from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from src.database import Base

class WeatherLog(Base):
    __tablename__ = "weather_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    city = Column(String(100), nullable=False)
    country = Column(String(10), nullable=False)
    temperature = Column(Float, nullable=False)
    feels_like = Column(Float, nullable=False)
    humidity = Column(Integer, nullable=False)
    description = Column(String(150), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))