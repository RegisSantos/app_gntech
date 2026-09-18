import os
import httpx
from fastapi import HTTPException, status

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

async def fetch_city_weather(city_name: str) -> dict:
    if not OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Chave da API OpenWeather não configurada."
        )

    params = {
        "q": city_name,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric",
        "lang": "pt_br"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(BASE_URL, params=params)

    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cidade '{city_name}' não encontrada."
        )
    elif response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail="Erro ao consultar a API da OpenWeather."
        )

    data = response.json()

    return {
        "city_name": data.get("name"),
        "country": data.get("sys", {}).get("country"),
        "temp": data.get("main", {}).get("temp"),
        "feels_like": data.get("main", {}).get("feels_like"),
        "temp_min": data.get("main", {}).get("temp_min"),
        "temp_max": data.get("main", {}).get("temp_max"),
        "humidity": data.get("main", {}).get("humidity"),
        "description": data.get("weather", [{}])[0].get("description", "").capitalize()
    }