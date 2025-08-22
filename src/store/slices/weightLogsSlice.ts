import { StateCreator } from "zustand";
import { WeightLog } from "@/types";

export interface WeightLogsSlice {
  weightLogs: WeightLog[];

  addWeightLog: (weight: number, date: string) => void;
  updateWeightLog: (id: string, weight: number) => void;
  deleteWeightLog: (id: string) => void;
  getLatestWeight: () => WeightLog | null;
  getWeightByDate: (date: string) => WeightLog | null;
}

export const createWeightLogsSlice: StateCreator<
  WeightLogsSlice,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  WeightLogsSlice
> = (set, get) => ({
  weightLogs: [],

  addWeightLog: (weight, date) =>
    set((state) => {
      // Remove any existing log for the same date
      state.weightLogs = state.weightLogs.filter((log) => log.date !== date);

      const newLog: WeightLog = {
        id: `weight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        date,
        weight,
      };

      state.weightLogs.push(newLog);

      // Sort by date descending
      state.weightLogs.sort((a, b) => b.date.localeCompare(a.date));
    }),

  updateWeightLog: (id, weight) =>
    set((state) => {
      const index = state.weightLogs.findIndex((log) => log.id === id);
      if (index !== -1) {
        state.weightLogs[index].weight = weight;
      }
    }),

  deleteWeightLog: (id) =>
    set((state) => {
      state.weightLogs = state.weightLogs.filter((log) => log.id !== id);
    }),

  getLatestWeight: () => {
    const logs = get().weightLogs;
    return logs.length > 0 ? logs[0] : null; // Already sorted by date desc
  },

  getWeightByDate: (date) => {
    return get().weightLogs.find((log) => log.date === date) || null;
  },
});
