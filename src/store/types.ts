// Store-specific types that extend the base types
export interface StoreState {
  // UI State
  selectedDate: string; // ISO date string for the currently selected date

  // Loading states
  isEstimating: boolean;
  estimationError: string | null;
}

// Re-export types from main types file for convenience
export * from "@/types";
