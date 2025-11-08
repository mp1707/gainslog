import { useMemo } from "react";
import type { Favorite } from "@/types/models";

export const useFavoritesFilter = (
  favorites: Favorite[],
  searchQuery: string
): Favorite[] => {
  return useMemo(() => {
    if (!favorites.length) return [] as Favorite[];

    const query = searchQuery.trim().toLowerCase();
    if (!query) return favorites;

    return favorites.filter((favorite) => {
      const haystack = `${favorite.title} ${
        favorite.description ?? ""
      }`.toLowerCase();
      return haystack.includes(query);
    });
  }, [favorites, searchQuery]);
};
