from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from src.database import Base

class WeatherLog(Base):
    __tablename__ = "weather_logs"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(255), nullable=False)
    country = Column(String(10))
    temperature = Column(Float)
    feels_like = Column(Float)
    humidity = Column(Integer)
    description = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())