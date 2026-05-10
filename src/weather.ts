import { cacheWeather, getCachedWeather } from "./db";
import type { WeatherData } from "./types";

const URL =
  "https://api.open-meteo.com/v1/forecast?latitude=55.75&longitude=37.62&current=temperature_2m,wind_speed_10m,weather_code";

export async function fetchWeather(allowNetwork: boolean): Promise<{ data: WeatherData; fromCache: boolean }> {
  if (allowNetwork) {
    try {
      const response = await fetch(URL);
      if (!response.ok) throw new Error("Failed to fetch weather");
      const json = await response.json();
      const data: WeatherData = {
        temperature: json.current.temperature_2m,
        windSpeed: json.current.wind_speed_10m,
        weatherCode: json.current.weather_code,
        fetchedAt: new Date().toISOString(),
      };
      await cacheWeather(data);
      return { data, fromCache: false };
    } catch {
      // Fall back to cache below when network fails.
    }
  }

  const cached = await getCachedWeather();
  if (cached) {
    return { data: cached, fromCache: true };
  }

  return {
    data: {
      temperature: 0,
      windSpeed: 0,
      weatherCode: 0,
      fetchedAt: new Date().toISOString(),
    },
    fromCache: true,
  };
}
