import AsyncStorage from "@react-native-async-storage/async-storage";

import type { WardrobeItem, WeatherData } from "./types";

let userScope: string = "guest";

export function setDbUserScope(userId: string | null) {
  userScope = userId && userId.length > 0 ? userId : "guest";
}

export function getLocalDbStorageLabel() {
  return userScope;
}

export async function checkLocalDbHealth(): Promise<{
  ok: boolean;
  message: string;
  itemCount: number;
  storageLabel: string;
}> {
  try {
    await initDb();
    const items = await listItems();
    return {
      ok: true,
      message: "OK",
      itemCount: items.length,
      storageLabel: userScope,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : String(e),
      itemCount: 0,
      storageLabel: userScope,
    };
  }
}

function itemsKey() {
  return `web.wardrobe_items.${userScope}`;
}

function cacheKey() {
  return `web.api_cache.weather.${userScope}`;
}

async function getWebItems(): Promise<WardrobeItem[]> {
  const raw = await AsyncStorage.getItem(itemsKey());
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WardrobeItem[];
  } catch {
    return [];
  }
}

async function setWebItems(items: WardrobeItem[]) {
  await AsyncStorage.setItem(itemsKey(), JSON.stringify(items));
}

export async function initDb() {
  const existing = await AsyncStorage.getItem(itemsKey());
  if (!existing) await AsyncStorage.setItem(itemsKey(), "[]");
}

export async function listItems(): Promise<WardrobeItem[]> {
  const items = await getWebItems();
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function createItem(input: Omit<WardrobeItem, "id">) {
  const items = await getWebItems();
  const nextId = items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
  items.push({ id: nextId, ...input });
  await setWebItems(items);
}

export async function updateItem(item: WardrobeItem) {
  const items = await getWebItems();
  const next = items.map((entry) => (entry.id === item.id ? item : entry));
  await setWebItems(next);
}

export async function deleteItem(id: number) {
  const items = await getWebItems();
  await setWebItems(items.filter((entry) => entry.id !== id));
}

export async function cacheWeather(data: WeatherData) {
  await AsyncStorage.setItem(cacheKey(), JSON.stringify(data));
}

export async function getCachedWeather(): Promise<WeatherData | null> {
  const raw = await AsyncStorage.getItem(cacheKey());
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WeatherData;
  } catch {
    return null;
  }
}
