import { create } from "zustand";
import { FavoriteEntry, FoodLog } from "@/types";
import { getFavoriteEntries, saveFavoriteEntries } from "@/lib/storage";

interface FavoritesStore {
  favorites: FavoriteEntry[];
  isLoading: boolean;
  loadFavorites: () => Promise<void>;
  addFromLog: (log: FoodLog) => Promise<void>;
  removeMatchingLog: (log: FoodLog) => Promise<void>;
  toggleForLog: (log: FoodLog) => Promise<void>;
  isFavorite: (log: FoodLog) => boolean;
  filter: (term: string) => FavoriteEntry[];
}

const normalize = (value?: string) => (value || "").trim();

const fromLogToEntry = (log: FoodLog): FavoriteEntry => ({
  title: normalize(log.userTitle) || log.generatedTitle,
  description: normalize(log.userDescription),
  calories: log.calories,
  protein: log.protein,
  carbs: log.carbs,
  fat: log.fat,
});

const isSameEntry = (a: FavoriteEntry, b: FavoriteEntry) => {
  return (
    normalize(a.title) === normalize(b.title) &&
    normalize(a.description) === normalize(b.description) &&
    a.calories === b.calories &&
    a.protein === b.protein &&
    a.carbs === b.carbs &&
    a.fat === b.fat
  );
};

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favorites: [],
  isLoading: false,

  loadFavorites: async () => {
    set({ isLoading: true });
    try {
      const entries = await getFavoriteEntries();
      set({ favorites: entries });
    } catch (e) {
      // noop, keep empty
    } finally {
      set({ isLoading: false });
    }
  },

  addFromLog: async (log: FoodLog) => {
    const entry = fromLogToEntry(log);
    const current = get().favorites;
    // avoid duplicates
    const exists = current.some((f) => isSameEntry(f, entry));
    const next = exists ? current : [entry, ...current];
    set({ favorites: next });
    await saveFavoriteEntries(next);
  },

  removeMatchingLog: async (log: FoodLog) => {
    const entry = fromLogToEntry(log);
    const current = get().favorites;
    const next = current.filter((f) => !isSameEntry(f, entry));
    set({ favorites: next });
    await saveFavoriteEntries(next);
  },

  toggleForLog: async (log: FoodLog) => {
    const isFav = get().isFavorite(log);
    if (isFav) {
      await get().removeMatchingLog(log);
    } else {
      await get().addFromLog(log);
    }
  },

  isFavorite: (log: FoodLog) => {
    const entry = fromLogToEntry(log);
    return get().favorites.some((f) => isSameEntry(f, entry));
  },

  filter: (term: string) => {
    const q = term.trim().toLowerCase();
    if (!q) return get().favorites;
    return get().favorites.filter((f) => {
      const title = normalize(f.title).toLowerCase();
      const desc = normalize(f.description).toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  },
}));

// Selectors for performance-friendly consumption
export const selectFavorites = (state: FavoritesStore) => state.favorites;
export const selectFavoritesIsLoading = (state: FavoritesStore) =>
  state.isLoading;
export const selectIsFavoriteForLog =
  (log: FoodLog) => (state: FavoritesStore) =>
    state.isFavorite(log);
export const selectFilteredFavorites =
  (term: string) => (state: FavoritesStore) =>
    state.filter(term);
