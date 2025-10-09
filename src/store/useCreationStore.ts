import { create } from "zustand";
import { FoodLog } from "@/types/models";
import { generateFoodLogId } from "@/utils/idGenerator";

type DraftsById = Record<string, FoodLog>;

interface CreationState {
  draftsById: DraftsById;
  // Create a new draft and return its id
  startNewDraft: (selectedDate: string) => string;
  // Start editing an existing log (copy), keyed by log.id
  startEditingDraft: (log: FoodLog) => void;
  // Update a draft by id
  updateDraft: (id: string, update: Partial<FoodLog>) => void;
  // Remove a draft by id (on unmount/dismiss)
  clearDraft: (id: string) => void;
}

export const useCreationStore = create<CreationState>((set, get) => ({
  draftsById: {},

  startNewDraft: (selectedDate) => {
    const id = generateFoodLogId();
    const draft: FoodLog = {
      id,
      title: "",
      description: "",
      supabaseImagePath: "",
      localImagePath: "",
      logDate: selectedDate,
      createdAt: new Date().toISOString(),
      foodComponents: [],
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      isEstimating: false,
    };
    set((state) => ({ draftsById: { ...state.draftsById, [id]: draft } }));
    return id;
  },

  startEditingDraft: (log) => {
    set((state) => ({
      draftsById: { ...state.draftsById, [log.id]: { ...log } },
    }));
  },

  updateDraft: (id, update) => {
    set((state) => {
      const existing = state.draftsById[id];
      if (!existing) return {};
      return {
        draftsById: { ...state.draftsById, [id]: { ...existing, ...update } },
      };
    });
  },

  clearDraft: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.draftsById;
      return { draftsById: rest };
    });
  },
}));
