import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import type { WardrobeItem, WeatherData } from "./types";

let userScope: string = "guest";
let dbPromise: Promise<SQLiteDatabase> | null = null;

/**
 * Routes local SQLite to a separate file per Firebase uid.
 * Pass `null` for signed-out / guest data (`wardrobe_guest.db`).
 */
export function setDbUserScope(userId: string | null) {
  const next = userId && userId.length > 0 ? userId : "guest";
  if (next === userScope) return;
  userScope = next;
  dbPromise = null;
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

function databaseFileName() {
  return `wardrobe__${userScope}.db`;
}

function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const database = await openDatabaseAsync(databaseFileName());
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS wardrobe_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          date TEXT NOT NULL,
          imageUri TEXT
        );

        CREATE TABLE IF NOT EXISTS api_cache (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        );
      `);
      return database;
    })();
  }
  return dbPromise;
}

export async function initDb() {
  await getDb();
}

export async function listItems(): Promise<WardrobeItem[]> {
  const db = await getDb();
  return db.getAllAsync<WardrobeItem>("SELECT * FROM wardrobe_items ORDER BY date DESC;");
}

export async function createItem(input: Omit<WardrobeItem, "id">) {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO wardrobe_items (title, description, category, date, imageUri) VALUES (?, ?, ?, ?, ?);",
    [input.title, input.description, input.category, input.date, input.imageUri ?? null],
  );
}

export async function updateItem(item: WardrobeItem) {
  const db = await getDb();
  await db.runAsync(
    "UPDATE wardrobe_items SET title = ?, description = ?, category = ?, date = ?, imageUri = ? WHERE id = ?;",
    [item.title, item.description, item.category, item.date, item.imageUri ?? null, item.id],
  );
}

export async function deleteItem(id: number) {
  const db = await getDb();
  await db.runAsync("DELETE FROM wardrobe_items WHERE id = ?;", [id]);
}

export async function cacheWeather(data: WeatherData) {
  const db = await getDb();
  await db.runAsync(
    "INSERT OR REPLACE INTO api_cache (key, value, updatedAt) VALUES (?, ?, ?);",
    ["weather", JSON.stringify(data), new Date().toISOString()],
  );
}

export async function getCachedWeather(): Promise<WeatherData | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ value: string }>("SELECT value FROM api_cache WHERE key = 'weather' LIMIT 1;");
  if (!rows.length) return null;
  try {
    return JSON.parse(rows[0].value) as WeatherData;
  } catch {
    return null;
  }
}
