// UI exports
export * from './ui';

// Hook exports (excluding useFoodLogs which is replaced by Zustand store)
export { useFoodLogModal } from './hooks/useFoodLogModal';
export { useNutritionEstimation } from './hooks/useNutritionEstimation';
export type { UseFoodLogModalReturn } from './hooks/useFoodLogModal';
export type { UseNutritionEstimationReturn } from './hooks/useNutritionEstimation';

// Utility exports
export { mergeNutritionData } from './utils';