import { useCallback, useEffect, useMemo, useState } from "react";

import { useAppSettings } from "../context/AppContext";
import { createItem, deleteItem, initDb, listItems, updateItem } from "../db";
import { applySearchFilterSort, type SortType } from "../search";
import type { WardrobeItem } from "../types";

type ItemInput = Omit<WardrobeItem, "id">;

export function useWardrobeViewModel() {
  const { firebaseUid, isFirebaseConfigured } = useAppSettings();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortType, setSortType] = useState<SortType>("newest");

  const refresh = useCallback(async () => {
    await initDb();
    const rows = await listItems();
    setItems(rows);
  }, []);

  useEffect(() => {
    if (isFirebaseConfigured && firebaseUid === undefined) return;
    void refresh();
  }, [isFirebaseConfigured, firebaseUid, refresh]);

  const visibleItems = useMemo(
    () => applySearchFilterSort(items, searchQuery, categoryFilter, sortType),
    [items, searchQuery, categoryFilter, sortType],
  );

  const categories = useMemo(() => {
    const set = new Set(items.map((item) => item.category));
    return ["all", ...Array.from(set)];
  }, [items]);

  const create = async (input: ItemInput) => {
    await createItem(input);
    await refresh();
  };

  const update = async (item: WardrobeItem) => {
    await updateItem(item);
    await refresh();
  };

  const remove = async (id: number) => {
    await deleteItem(id);
    await refresh();
  };

  return {
    visibleItems,
    categories,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    sortType,
    setSortType,
    create,
    update,
    remove,
    refresh,
  };
}
