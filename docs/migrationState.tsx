/**
 * Migration Checkpoint: Legacy → New modular store/hooks/types (complete)
 *
 * Objectives (achieved)
 * - Removed legacy runtime logic under `src/store-legacy`, `src/hooks-legacy`, `src/utils-legacy`, `src/types-legacy`.
 * - Wired the app to the new architecture under `src/store`, `src/hooks-new`, `src/utils`, `src/services`, `src/types`.
 * - Unified API/UI types under `src/types`. Supabase client now uses these types.
 *
 * Core New Architecture
 * - Store: `src/store/index.ts` (Zustand + persist + immer) combining slices:
 *   • FoodLogs: `src/store/slices/foodLogsSlice.ts`
 *   • Favorites: `src/store/slices/favoritesSlice.ts`
 *   • UserSettings: `src/store/slices/userSettingsSlice.ts`
 *   • WeightLogs: `src/store/slices/weightLogsSlice.ts`
 * - Hooks (new):
 *   • `src/hooks-new/useFoodEstimation.ts` (estimateFromText, estimateFromImage, createManualLog)
 *   • `src/hooks-new/useDateNavigation.ts`
 *   • `src/hooks-new/useDailyTotals.ts`, `src/hooks-new/useMonthlyData.ts`
 * - Utils:
 *   • `src/utils/nutrition.ts` exposes `calculateDailyTargets`, `validateNutritionValues`, `getConfidenceInfo`.
 * - Types (consolidated): `src/types/index.ts`
 *   • Domain: `FoodLog`, `FavoriteEntry`, `UserSettings`, `DailyTargets`, `WeightLog`.
 *   • API: `FoodEstimateRequest`, `ImageEstimateRequest`, `FoodEstimateResponse`.
 *   • UI/flow: `ModalMode`, `ButtonProps`, `TextInputProps`, `ActivityLevel`, `GoalType`, `ProteinCalculationMethod`, `CalorieCalculationMethod`, `CalorieIntakeParams`, `CalorieGoals`, `BadgeProps`.
 *   • `FoodLog` includes transient fields: `localImageUri`, `isUploading`, `isTranscribing`.
 *
 * Global UI trigger flow (fab/new-log)
 * - Store actions: `triggerManualLog`, `triggerCameraCapture`, `triggerLibraryCapture`, `triggerAudioCapture`, `triggerFavorites`, `clearTrigger` (state: `triggerAction`).
 *
 * Changes by Area
 * 1) Supabase
 *    - `src/lib/supabase.ts`: imports API types from `@/types`. Endpoints unchanged.
 *
 * 2) Daily Log creation/editing
 *    - `src/hooks/useImageCapture.ts`: creates partial `FoodLog`, uploads to Storage, updates transient flags.
 *    - `src/components/daily-food-logs/LogModal/FoodLogModal.tsx`: uses `useFoodEstimation` + `useAppStore.updateFoodLog`; legacy validation removed in favor of `validateNutritionValues`.
 *    - `src/hooks/useFoodLogForm.ts`: typed with new `FoodLog` and initializes using user→generated macro precedence.
 *    - `src/components/daily-food-logs/FoodImageDisplay/FoodImageDisplay.tsx`: updated to new `FoodLog`.
 *    - `src/hooks/useFoodLogModal.ts`: migrated to `FoodLog` + `ModalMode` from `@/types`.
 *
 * 3) AI estimation hook
 *    - `src/hooks/useNutritionEstimation.ts`: migrated from legacy types/utils.
 *      • Merges AI results with user-entered macros (user takes precedence), validates via `validateNutritionValues`.
 *      • Updates generated fields (`generatedCalories/Protein/Carbs/Fat`) only when corresponding user value is absent.
 *      • Handles invalid image responses and success haptics.
 *
 * 4) Daily Log dashboard
 *    - `FoodLogScreen`, `FoodLogsList`, `LogCard` use new store/types and confidence helpers.
 *    - `app/(tabs)/index.tsx` Today tab: wired to trigger actions; modal save handler is a no-op (handled inside modal flows).
 *
 * 5) Detail page
 *    - `app/food-log-detail/[id].tsx`: implemented "Re-estimate with AI".
 *      • If `imageUrl` present → `estimateNutritionImageBased`; else → `estimateNutritionTextBased`.
 *      • Updates current log’s generated fields and `estimationConfidence`; success haptics; invalid image handled.
 *    - Favorites on detail: uses `toggleFavoriteForLog` and `isFavoriteForLog` (removed ad-hoc `isFavorite` field usage).
 *
 * 6) Settings
 *    - Replaced legacy types with new `@/types` in: `sex.tsx`, `activitylevel.tsx`, `goals.tsx`, `proteinCalculator/goals.tsx`, `manualInput.tsx`.
 *    - Removed legacy storage import (`saveCalorieCalculatorParams`).
 *    - Calorie goals computed via `utils/calculateCalories.tsx`; targets updated via store (`calculateAndSetTargets`, `setDailyTargets`).
 *
 * 7) Shared components typing
 *    - `shared/Badge`, `shared/Button`, `shared/TextInput`, LogModal `FormField`, `ModalHeader`, `ProteinCalculationCard` now import props/types from `@/types`.
 *
 * 8) Favorites slice
 *    - `toggleFavoriteForLog`, `isFavoriteForLog` perform equivalence checks on title/description/macros to map logs to favorites robustly.
 *
 * 9) Aliases & Legacy Removal
 *    - Removed legacy aliases from `tsconfig.json` and `babel.config.js`.
 *    - Excluded legacy directories from TS compilation.
 *    - Deleted contents of `src/store-legacy`, `src/hooks-legacy`, `src/utils-legacy`, `src/types-legacy`.
 *    - Updated `docs/project-structure.txt` to reflect new architecture and removals.
 *
 * Current Open Items / QA Notes
 * - Overview month state: still local-only in `app/(tabs)/overview.tsx`.
 *   • Option A: Use `useMonthlyData` for navigation/derived totals.
 *   • Option B: Add `selectedMonth` to store for persistence/sharing across tabs.
 * - Post-migration smoke tests recommended (see checklist below).
 *
 * Validation Checklist
 * - Build & type-check; run linter (status: clean on edited files).
 * - Smoke tests:
 *   • Create manual/text/image logs; verify persistence & daily totals.
 *   • Edit in detail screen; verify fields update and re-estimation works.
 *   • Toggle favorites; create log from favorite.
 *   • Settings calculators (calorie, protein, fat) incl. manual inputs; verify targets update immediately.
 *   • Overview: verify monthly rendering; finalize month navigation persistence strategy.
 */

// Intentionally no runtime export; this file documents the migration state.
export {};
