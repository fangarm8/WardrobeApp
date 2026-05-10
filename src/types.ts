export type Language = "en" | "ru";
export type ThemeMode = "light" | "dark";

export type WardrobeItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  imageUri?: string | null;
};

export type WeatherData = {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  fetchedAt: string;
};
