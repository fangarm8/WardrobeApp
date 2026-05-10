import Fuse from "fuse.js";

import type { WardrobeItem } from "./types";

export type SortType = "newest" | "oldest";

export function applySearchFilterSort(
  items: WardrobeItem[],
  query: string,
  category: string,
  sortType: SortType,
) {
  let result = [...items];

  if (category !== "all") {
    result = result.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }

  if (query.trim()) {
    const fuse = new Fuse(result, {
      includeScore: true,
      threshold: 0.4,
      keys: ["title", "description", "category"],
    });
    result = fuse.search(query).map((entry) => entry.item);
  }

  result.sort((a, b) => {
    const first = new Date(a.date).getTime();
    const second = new Date(b.date).getTime();
    return sortType === "newest" ? second - first : first - second;
  });

  return result;
}
