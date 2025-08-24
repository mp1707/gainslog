/**
 * Migration Checkpoint: Legacy store/hooks → New modular store/hooks
 *
 * Goal
 * - Remove legacy state logic under `src/store-legacy`, `src/hooks-legacy`, `src/utils-legacy`, `src/types-legacy` from the runtime UI.
 * - Wire the app to the new architecture under `src/store`, `src/hooks-new`, `src/utils`, `src/services`, `src/types`.
 * - Preserve AI estimation service file `src/lib/supabase.ts` unchanged (per requirement).
 *
 * Core New Architecture (in use)
 * - Store: `src/store/index.ts` (Zustand + persist + immer) combining slices:
 *   - FoodLogs: `src/store/slices/foodLogsSlice.ts` (foodLogs, selectedDate, add/update/delete/getLogsByDate/getDailyTotals)
 *   - Favorites: `src/store/slices/favoritesSlice.ts` (favorites, add/update/delete/toggleFavoriteForLog/createLogFromFavorite)
 *   - UserSettings: `src/store/slices/userSettingsSlice.ts` (userSettings, dailyTargets, updateUserSettings, calculateAndSetTargets, setDailyTargets, resetDailyTargets)
 *   - WeightLogs: `src/store/slices/weightLogsSlice.ts`
 * - Hooks (new):
 *   - `src/hooks-new/useFoodEstimation.ts` (estimateFromText, estimateFromImage, createManualLog)
 *   - `src/hooks-new/useDateNavigation.ts`
 *   - `src/hooks-new/useDailyTotals.ts`, `src/hooks-new/useMonthlyData.ts` (available for Overview integration)
 * - Utils:
 *   - `src/utils/nutrition.ts` now exposes `calculateDailyTargets`, validation, and `getConfidenceInfo` (migrated from legacy)
 * - Types:
 *   - `src/types/index.ts` (new primitives). `FoodLog` extended with transient fields: `localImageUri`, `isUploading`, `isTranscribing`.
 *
 * UI Trigger Flow (fab/new-log)
 * - Added to store: `triggerAction` + actions: `triggerManualLog`, `triggerCameraCapture`, `triggerLibraryCapture`, `triggerAudioCapture`, `triggerFavorites`, `clearTrigger`.
 *
 * Completed Migrations (by area)
 * 1) Theming
 *    - `src/theme/ThemeProvider.tsx`: Persist color scheme with AsyncStorage (replaced legacy storage calls). Memoized `colors`, `value`.
 *
 * 2) Daily Log creation/editing
 *    - `src/components/daily-food-logs/NewLogButton/NewLogButton.tsx`: uses new trigger actions from store.
 *    - `src/components/daily-food-logs/NewLogSheet/NewLogSheet.tsx`: unchanged; consumes new handlers via props.
 *    - `src/hooks/useImageCapture.ts`: emits new `FoodLog` (partial), uploads to Supabase Storage, updates transient fields (`isUploading`, `localImageUri`). Reads `selectedDate` from new store.
 *    - `src/components/daily-food-logs/LogModal/FoodLogModal.tsx`: now uses new `useFoodEstimation` and `useAppStore.updateFoodLog`. Validation uses `validateNutritionValues`. Works for manual, text, and image flows. Emits saved `FoodLog`.
 *    - `src/hooks/useFoodLogForm.ts`: migrated to new `FoodLog` typing; initializes from user or generated macro fields.
 *    - `src/components/daily-food-logs/FoodImageDisplay/FoodImageDisplay.tsx`: migrated to `FoodLog`.
 *
 * 3) Daily Log listing / dashboard
 *    - `src/components/daily-food-logs/FoodLogScreen/FoodLogScreen.tsx`: uses new store, new date hook, computes totals from user→generated values.
 *    - `src/components/daily-food-logs/FoodLogsList/FoodLogsList.tsx`: uses `useAppStore.toggleFavoriteForLog`; typed with `FoodLog`.
 *    - `src/components/daily-food-logs/LogCard/LogCard.tsx`: uses new `FoodLog` and `getConfidenceInfo` from `utils/nutrition`.
 *    - `app/(tabs)/index.tsx`: Today tab updated to new triggers; `handleSave` is now a no-op (modal handles save/add via store).
 *
 * 4) Detail page
 *    - `app/food-log-detail/[id].tsx`: uses `useAppStore` (`updateFoodLog`, `deleteFoodLog`). Nutrition/title/description editing works. Re-estimation button is still a TODO (see below).
 *    - `src/components/detail-page/*` (NutritionViewCard, NutritionEditCard, ImageSection, ImagePickerSection, MetadataSection): migrated to `FoodLog` and new macro precedence.
 *
 * 5) Overview tab
 *    - `app/(tabs)/overview.tsx`: reads logs and targets from new store; computes monthly totals using user→generated macro precedence; sets selected day via `setSelectedDate`.
 *      NOTE: Month selection state is currently local-only (uses a constant `selectedMonth` = current month). See TODO.
 *
 * 6) Settings
 *    - Main `app/(tabs)/settings/index.tsx`: reset wired to `resetDailyTargets`. UI uses new `dailyTargets` and `useNutritionCalculations`.
 *    - Calorie calculator (`sex`, `age`, `weight`, `height`, `activitylevel`, `manualInput`, `goals`, `editCalories`): migrated to new store.
 *      • Inputs call `updateUserSettings` (sex/age/weight/height/activity).
 *      • `goals.tsx` sets `calorieGoalType` via `updateUserSettings` and calls `calculateAndSetTargets` to derive macros.
 *      • Manual calories uses `setDailyTargets({ calories })`.
 *    - Protein calculator (`weight`, `manualInput`, `goals`, `editProtein`): migrated.
 *      • `goals.tsx` computes protein from multiplier and weight; uses `setDailyTargets({ protein })` and persists chosen multiplier via `updateUserSettings({ proteinCalculationFactor })`.
 *    - Fat calculator (`editFat`, `manualInput`): reads new `dailyTargets`. Manual fat input uses `useNutritionCalculations` to update fat% and derived macros.
 *
 * 7) Favorites
 *    - `src/store/slices/favoritesSlice.ts`: added `toggleFavoriteForLog`, `isFavoriteForLog` for log equivalence matching. `FoodLogsList` uses it.
 *    - `src/hooks/useFavoriteSelection.ts`: migrated to new store; creates new `FoodLog` from a favorite (mapped into user fields).
 *
 * 8) Misc
 *    - `src/lib/index.ts`: removed re-export of legacy storage.
 *    - `src/utils/nutrition.ts`: added confidence helpers; validation utilities.
 *
 * Known Constraints
 * - MUST NOT change `src/lib/supabase.ts` (kept as-is). It still imports API types from `types-legacy`; acceptable interim.
 *
 * OPEN TODOs (actionable)
 * A) Remaining legacy references to remove or replace
 *   - Delete or stop importing: `src/store-legacy`, `src/hooks-legacy`, `src/utils-legacy`, `src/types-legacy` once fully unused.
 *   - Scan for any lingering imports:
 *     • `useFoodLogStore` (legacy): remove all usages.
 *     • `types-legacy/indexLegacy` for UI prop types (e.g., ButtonProps, TextInputProps): replace with local component prop types or unify under `src/types`.
 *     • `utils-legacy/utils` (e.g., `getConfidenceInfo`): confirm all usages replaced; Badge component may still reference a local implementation—validate.
 *   - Update path mappings in `tsconfig.json` and `babel.config.js` to remove `@/store-legacy`, `@/hooks-legacy`, `@/utils-legacy` once no usages remain.
 *
 * B) Overview tab month state
 *   - Current file `app/(tabs)/overview.tsx` uses a constant `selectedMonth` and does not persist or allow navigation reliably.
 *   - Options:
 *     1) Use `src/hooks-new/useMonthlyData.ts` to provide month navigation and derived totals, or
 *     2) Add `selectedMonth` and `setSelectedMonth` to the new store (preferred if month needs to persist/tab-share).
 *   - Ensure `MonthPicker` drives month state and overview recomputes with the chosen month.
 *
 * C) Food log re-estimation from Detail screen
 *   - In `app/food-log-detail/[id].tsx`, the "Re-estimate with AI" button is stubbed.
 *   - Implement using `useFoodEstimation`:
 *     • If `currentLog.imageUrl`, call `estimateFromImage(imageUrl, title?, description?)` then `updateFoodLog` with returned generated fields.
 *     • Else fall back to `estimateFromText(title, description?)`.
 *     • Consider optimistic UI (set `estimationConfidence=0` during processing) and haptic feedback on success.
 *
 * D) Settings polish & consistency
 *   - Ensure `calculateAndSetTargets` is called where appropriate when core user settings change (sex/age/weight/height/activity/calorieGoalType).
 *   - Verify `editProtein` and `editCalories` navigation flows no longer rely on legacy "clear*CalculatorData" actions.
 *   - Confirm fat manual input guardrails (max fat %) still correct under new calculations.
 *
 * E) Replace legacy API types gradually
 *   - Long-term: shift API request/response types imported in various places from `src/types-legacy` to `src/types`.
 *   - Because `src/lib/supabase.ts` must remain unchanged, provide re-exports in `src/types` or accept mixed typing temporarily.
 *
 * F) Clean-up & removal
 *   - After A–E fixed and app compiles/runs:
 *     • Remove legacy directories: `src/store-legacy`, `src/hooks-legacy`, `src/utils-legacy`, `src/types-legacy`.
 *     • Remove aliases from `tsconfig.json` and `babel.config.js`.
 *     • Update `docs/project-structure.txt` to reflect new architecture.
 *
 * Validation Checklist (when resuming)
 * - Build & type-check; run linter.
 * - Smoke test flows:
 *   • Create manual/text/image logs; verify persistence & totals.
 *   • Edit a log in detail screen; verify update.
 *   • Favorites toggle and add-from-favorite.
 *   • Settings calculators (calorie, protein, fat) and reset; watch targets update.
 *   • Overview month navigation (once fixed) and day tap → Today tab.
 */

// Intentionally no runtime export; this file documents the migration state.
export {};

