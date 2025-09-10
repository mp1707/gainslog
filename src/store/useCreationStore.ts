import { create } from "zustand";
import { FoodLog } from "@/types/models";
import { generateFoodLogId } from "@/utils/idGenerator";

interface CreationState {
  pendingLog: FoodLog | null;
  startNewLog: (selectedDate: string) => void;
  startEditingLog: (log: FoodLog) => void;
  updatePendingLog: (update: Partial<FoodLog>) => void;
  clearPendingLog: () => void;
}

export const useCreationStore = create<CreationState>((set, get) => ({
  pendingLog: null,

  startNewLog: (selectedDate) => {
    set({
      pendingLog: {
        id: generateFoodLogId(),
        title: "",
        description: "",
        supabaseImagePath: "",
        localImagePath: "",
        logDate: selectedDate,
        createdAt: new Date().toISOString(),
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        estimationConfidence: 0,
      },
    });
  },

  startEditingLog: (log) => {
    set({ pendingLog: { ...log } }); // Use a copy to avoid mutating the original log
  },

  updatePendingLog: (update) => {
    set((state) => {
      if (!state.pendingLog) return {};
      return {
        pendingLog: { ...state.pendingLog, ...update },
      };
    });
  },

  clearPendingLog: () => {
    set({ pendingLog: null });
  },
}));
