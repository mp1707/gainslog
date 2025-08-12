### Refactoring Save State for GainsLog

This document is the single source of truth for our ongoing refactoring journey. Treat it as a living “save state” you update as you go. The goal is to iteratively migrate the app toward a clean, maintainable, feature-based architecture aligned with atomic design principles, while preserving functionality and performance.

How to use this file

- Update the state of each entry as you progress: set to done when finished, and log meaningful, incremental changes in changeLog.
- Add new entries when new files/components are created. Remove entries only when files are deleted; in that case, keep a record of the deletion in changeLog.
- Keep edits small and frequent. After any meaningful refactor, add a brief note to changeLog with date and what changed.
- When you split large files (> ~200 lines), create new entries for the extracted modules and update the original file’s entry.
- Prefer updating system-level items first (cross-cutting concerns) before deep diving into file-level changes.

Legend for fields

- state: open | done
- priority: low | medium | high
- changeLog: short, dated bullets describing edits that occurred
- notes: optional reasoning, risks, or follow-ups
- dependencies: upstream/downstream modules to review when this item changes

System overview

- App Shell & Navigation: `App.tsx`, `app/_layout.tsx`, `app/(tabs)/*`
- Design System & Theming: `src/theme.ts`, `design-system.json`, shared UI atoms/molecules/organisms under `src/shared/ui`
- Features:
  - Food Logging: `src/features/food-logging/*`
  - Image Capture: `src/features/image-capture/*`
  - Settings: `src/features/settings/*`
- State Management: `src/stores/*`
- Hooks: `src/hooks/*`, cross-feature hooks under `src/shared/hooks/*`
- Lib/Platform Services: `src/lib/*` (storage, supabase, toast)
- Supabase Edge Functions: `supabase/functions/*` and `supabase/edgefunctions/*`
- App configuration/build tooling: root configs (`app.config.ts`, `babel.config.js`, `eas.json`, `package.json`, etc.)

Global cross-cutting TODOs

- state: open | priority: high
  - changeLog:
    - [ ] Refactor UI to consistently follow atomic design and feature boundaries.
    - [ ] Enforce size constraint (~200 lines) across large components by extracting logic and splitting views/containers.
    - [ ] Centralize business logic into pure functions; reduce mixed concerns in components.
    - [ ] Normalize naming across files, exports, and directories; add barrel exports where missing.
    - [ ] Create/refine UI accessibility patterns (aria-equivalents where applicable for RN/Expo, TalkBack/VoiceOver flows).
    - [ ] Introduce error boundaries where sensible; standardize error handling UX.
    - [ ] Strengthen type safety: remove `any`, define domain types in `src/types` and feature-local `types.ts` where needed.
    - [ ] Audit side effects; ensure hooks/controllers isolate effects from pure render logic.
    - [ ] Improve testing surface (unit tests for pure functions, component tests for critical flows).
    - [ ] Performance audit (lists, images, memoization, virtualization where necessary).
  - notes: Apply incremental refactors feature-by-feature; verify no regression after each step.

---

## File-level checklist by system

Notes:

- All entries initially state: open unless explicitly done.
- Add a dated bullet in changeLog on each commit that touches the item.

### Root / App Shell

- path: `App.tsx`

  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Removed file. Consolidated entrypoint into `app/_layout.tsx` with Expo Router providers. Expo entry remains `expo-router/entry` via `package.json`.
  - notes: Duplicate root removed; Expo Router drives navigation.
  - dependencies: `src/App.tsx`, `app/_layout.tsx`

- path: `index.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Removed file. `expo-router/entry` handles registration; avoided duplicate registration.
  - notes: Registration handled by Expo Router entry.

- path: `app/_layout.tsx`

  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Added `KeyboardProvider` and `StatusBar` here. Keeps app providers centralized. Shows loading screen until fonts load, then renders `Stack` with `(tabs)`.
    - 2025-08-12: Loading screen now uses theme tokens for colors.
  - notes: App shell is now authoritative provider root.

- path: `app/(tabs)/_layout.tsx`

  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Verified tab config uses theme colors and hides headers; no code changes needed.
  - notes: Screen registration correct for `index`, `overview`, `favorites`, `settings`.

- path: `app/(tabs)/index.tsx`

  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Verified integration with Food Logging feature (screen + modal) and keyboard offset usage; no code changes.
  - notes: Container logic remains; future refactor tracked under feature.

- path: `app/(tabs)/favorites.tsx`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Verified usage of shared UI and favorites store; no code changes.
  - notes: OK.

- path: `app/(tabs)/overview.tsx`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Verified selectors and safe-area/tab bar spacing logic; no code changes.
  - notes: OK.

- path: `app/(tabs)/settings.tsx`
  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Verified delegation to Settings feature hooks and components; no code changes.
  - notes: OK.

### Configuration / Tooling

- path: `app.config.ts`

  - state: open
  - priority: low
  - changeLog: []
  - notes: Align with environment setups and asset linking.

- path: `babel.config.js`

  - state: open
  - priority: low
  - changeLog: []
  - notes: Ensure module resolver aliases match feature-based structure.

- path: `eas.json`

  - state: open
  - priority: low
  - changeLog: []
  - notes: Build profiles validated post-refactor.

- path: `package.json`

  - state: open
  - priority: medium
  - changeLog: []
  - notes: Remove unused deps; enforce scripts for lint/test/typecheck.

- path: `package-lock.json`

  - state: open
  - priority: low
  - changeLog: []
  - notes: Will change as deps evolve.

- path: `tsconfig.json`

  - state: open
  - priority: medium
  - changeLog: []
  - notes: Path aliases, strictness settings, incremental builds.

- path: `STYLE_GUIDE.md`

  - state: open
  - priority: low
  - changeLog: []
  - notes: Sync with refactoring principles; document conventions.

- path: `CLAUDE.md`

  - state: open
  - priority: low
  - changeLog: []
  - notes: Keep AI usage notes consistent with this save state.

- path: `.claude/agents/refactoring-architect.md`
  - state: open
  - priority: low
  - changeLog: []
  - notes: Profile document; ensure kept in sync with process.

### Assets

- path: `assets/icon.png`

  - state: open
  - priority: low
  - changeLog: []

- path: `assets/adaptive-icon.png`

  - state: open
  - priority: low
  - changeLog: []

- path: `assets/favicon.png`

  - state: open
  - priority: low
  - changeLog: []

- path: `assets/splash-icon.png`

  - state: open
  - priority: low
  - changeLog: []

- path: `assets/fonts/Nunito-Regular.ttf`

  - state: open
  - priority: low
  - changeLog: []

- path: `assets/fonts/Nunito-SemiBold.ttf`

  - state: open
  - priority: low
  - changeLog: []

- path: `assets/fonts/Nunito-Bold.ttf`
  - state: open
  - priority: low
  - changeLog: []

### Theme / Design System

- path: `design-system.json`

  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Verified alignment with `src/theme.ts` tokens (colors, typography, components). No structural changes required.
  - notes: In sync with theme tokens.

- path: `src/theme.ts`
  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Confirmed tokens and added usage in app loading UI. Exported barrel at `src/theme/index.ts` for clean imports.
  - notes: Central authority for tokens; helper getters used in app shell.

### Providers

- path: `src/providers/ThemeProvider.tsx`

  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Verified system preference listening and persistence. No functional changes needed.
  - notes: Provides `useTheme` and `useThemedStyles` helpers.

- path: `src/providers/index.ts`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Added barrel export for providers.
  - notes: Import as `@/providers`.

### Library / Services

- path: `src/lib/storage.ts`

  - state: done
  - priority: high
  - changeLog:
    - 2025-08-12: Introduced centralized `storageKeys` constants. Kept existing APIs; improved maintainability and migration safety.
  - notes: Typed keys reduce typos and ease future migrations.

- path: `src/lib/supabase.ts`

  - state: done
  - priority: high
  - changeLog:
    - 2025-08-12: Centralized env handling via new `src/lib/env.ts`. Kept client options; improved error surface for missing env.
  - notes: Use `env.SUPABASE_URL` and `env.SUPABASE_ANON_KEY`.

- path: `src/lib/env.ts`

  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Added typed env accessor with runtime validation and `isDev` flag.
  - notes: Prevents silent failures due to missing env.

- path: `src/lib/toast.ts`

  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Added `showSuccessToast` and `showInfoToast`. Kept error toast behavior consistent and top-positioned.
  - notes: Centralized toast utilities.

- path: `src/lib/index.ts`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Added barrel for lib exports.
  - notes: Clean import surface.

### App Entrypoint (src)

- path: `src/App.tsx`
  - state: done
  - priority: high
  - changeLog:
    - 2025-08-12: Removed file. Its `Slot` wrapper moved to `app/_layout.tsx` responsibilities under Expo Router.
  - notes: Eliminated duplication.

### Shared Types

- path: `src/types/index.ts`
  - state: done
  - priority: high
  - changeLog:
    - 2025-08-12: Centralized shared domain types. Added `Sex`, `ActivityLevel`, `CalorieIntakeParams`, `CalorieGoals`, `GoalType`, `ProteinCalculationMethod`, `CalorieCalculationMethod`. Updated imports across store, storage, calculators, and UI to consume `@/types`.
  - notes: UI atoms no longer declare calculation method types locally; store decoupled from UI modules.

### Global Hooks

- path: `src/hooks/useFonts.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Added explicit `UseFontsResult` type; improved internal typings; preserved fallback behavior on error.
  - notes: Used by `app/_layout.tsx`. OK.

- path: `src/hooks/index.ts`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Barrel export remains valid for `useFonts`.

### Global Components

- path: `src/components/AppText.tsx`

  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Audited and kept as global typography primitive. Verified tokens and used across features. No API change.
  - notes: Ensures consistent typography system usage.

- path: `src/components/Button.tsx`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Deprecated in favor of shared atom `src/shared/ui/atoms/Button/Button.tsx`. Re-exported shared Button from `src/components/index.ts` for stable import surface. Migrated imports and deleted duplicate file.
  - notes: Consolidated Button implementation to shared atoms.

- path: `src/components/Card.tsx`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Verified theme integration and usages in food-logging and shared UI. Kept as global container primitive.

- path: `src/components/FilterBadge.tsx`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Verified usage in overview. Kept component; aligned imports.

- path: `src/components/ProgressRow.tsx`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Verified usage in daily summary. Kept component and standardized import path.

- path: `src/components/SemanticBadge.tsx`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Verified semantic colors; confirmed separate from shared `Badge` atom. Kept component.

- path: `src/components/SkeletonShimmerEffect.tsx`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Verified reanimated shimmer overlay. Used by skeleton cards. Kept component.

- path: `src/components/index.ts`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Consolidated barrel to export all global components and re-export shared `Button` atom.

### State Stores

- path: `src/stores/useFavoritesStore.ts`

  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Added memoizable selectors (`selectFavorites`, `selectFavoritesIsLoading`, parameterized selectors). Verified immutability in add/remove/toggle. No API breaking changes.
  - notes: Consumers should use selectors for granular subscriptions.
  - followUps:
    - Migrate components to use new selectors (`selectFavorites`, `selectFavoritesIsLoading`, parameterized selectors) to reduce re-renders.

- path: `src/stores/useFoodLogStore.ts`
  - state: done
  - priority: high
  - changeLog:
    - 2025-08-12: Unified type imports to `@/types`. Tightened debounce type (`ReturnType<typeof setTimeout>`). Added memoizable selectors for all major slices and computed getters. No functional changes.
  - notes: Selectors reduce re-renders; computed selectors call store methods.
  - followUps:
    - Replace direct `useFoodLogStore()` usages across screens/components with memoizable selectors (`selectFoodLogs`, `selectSelectedDate`, etc.).
    - Verify key consumers: `FoodLogScreen.tsx`, `DailyProgressSummary`, `DailySummaryCard`, `FavoritesPickerModal`, and tab screens.

### Shared Icons

- path: `src/shared/icons/ArrowLeftIcon.tsx`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Migrated to `react-native-svg` with `size` and `color` props; created common `IconProps`.

- path: `src/shared/icons/ArrowRightIcon.tsx`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Migrated to `react-native-svg`; consumes shared `IconProps`.

- path: `src/shared/icons/CalendarIcon.tsx`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Migrated to `react-native-svg`; standardized API.

- path: `src/shared/icons/CameraIcon.tsx`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Migrated to `react-native-svg`; standardized API.

- path: `src/shared/icons/PencilIcon.tsx`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Migrated to `react-native-svg`; standardized API.

- path: `src/shared/icons/SettingsIcon.tsx`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Migrated to `react-native-svg`; standardized API.
- path: `src/shared/icons/index.ts`

- state: done
- priority: low
- changeLog:
  - 2025-08-12: Added barrel export for all icons and shared `IconProps`.

### Shared UI - Atoms

- path: `src/shared/ui/atoms/AnimatedCalculatorButton/AnimatedCalculatorButton.tsx`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Verified implementation aligns with theme tokens and accessibility. Kept logic. No API change.
- path: `src/shared/ui/atoms/AnimatedCalculatorButton/AnimatedCalculatorButton.styles.ts`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Removed unused `variant` parameter and dead variable. No visual change. Lint clean.
- path: `src/shared/ui/atoms/AnimatedCalculatorButton/index.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Barrel export verified.

- path: `src/shared/ui/atoms/Badge/Badge.tsx`
  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Fixed imports to use path aliases (`@/types`, `@/components`, `@/providers`, `@/shared/icons`). Removed unsupported icon variants and phosphor dependencies to use shared SVG icons. Resolved type error with icon props. Added consistent accessibility.
- path: `src/shared/ui/atoms/Badge/Badge.styles.ts`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Verified theme usage; kept legacy export for compatibility. No changes required.
- path: `src/shared/ui/atoms/Badge/index.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Barrel export verified.

- path: `src/shared/ui/atoms/Button/Button.tsx`
  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Verified props against `@/types`. Confirmed pressed/disabled states and a11y. No code changes needed.
- path: `src/shared/ui/atoms/Button/Button.styles.ts`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Verified usage of theme tokens; no code changes required.
- path: `src/shared/ui/atoms/Button/index.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Barrel export verified.

- path: `src/shared/ui/atoms/CalorieCalculationCard/CalorieCalculationCard.tsx`
  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Standardized `useTheme` import to `@/providers/ThemeProvider`. Left icon set (phosphor) as-is. Verified a11y props.
- path: `src/shared/ui/atoms/CalorieCalculationCard/CalorieCalculationCard.styles.ts`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Switched to `@/theme` and typed `colors` as `Colors`.
- path: `src/shared/ui/atoms/CalorieCalculationCard/index.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Barrel verified; no change needed.

- path: `src/shared/ui/atoms/FlowArrow/FlowArrow.tsx`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Kept phosphor icon import; fixed styles hook misuse by removing hook from styles file.
- path: `src/shared/ui/atoms/FlowArrow/FlowArrow.styles.ts`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Removed invalid `useTheme` usage; now uses `@/theme` directly for spacing.
- path: `src/shared/ui/atoms/FlowArrow/index.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Barrel verified; no change needed.

- path: `src/shared/ui/atoms/GoalSelectionCard/GoalSelectionCard.tsx`
  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Standardized provider import to `@/providers/ThemeProvider`. Kept phosphor icons. Confirmed a11y.
- path: `src/shared/ui/atoms/GoalSelectionCard/GoalSelectionCard.styles.ts`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Switched to `@/theme` and typed `colors` as `Colors`.
- path: `src/shared/ui/atoms/GoalSelectionCard/index.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Barrel verified; no change needed.

- path: `src/shared/ui/atoms/ImageSkeleton/ImageSkeleton.tsx`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Verified shimmer animation and props; no change needed.
- path: `src/shared/ui/atoms/ImageSkeleton/index.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Barrel verified; no change needed.

- path: `src/shared/ui/atoms/InlineRecordButton/InlineRecordButton.tsx`
  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Migrated to `@/providers/ThemeProvider`. Kept phosphor icons to match current set. A11y verified.
- path: `src/shared/ui/atoms/InlineRecordButton/InlineRecordButton.styles.ts`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Switched to `@/theme` types for `Colors`.
- path: `src/shared/ui/atoms/InlineRecordButton/index.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Barrel verified; no change needed.

- path: `src/shared/ui/atoms/LoadingSpinner/LoadingSpinner.tsx`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Standardized `useTheme` alias and exported props type.
- path: `src/shared/ui/atoms/LoadingSpinner/index.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Barrel verified; no change needed.

- path: `src/shared/ui/atoms/ManualEntryButton/ManualEntryButton.tsx`
  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Verified button import via barrel and kept component minimal.
- path: `src/shared/ui/atoms/ManualEntryButton/ManualEntryButton.styles.ts`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Left minimal style object; parent controls layout.
- path: `src/shared/ui/atoms/ManualEntryButton/index.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Barrel verified; no change needed.

- path: `src/shared/ui/atoms/NumericTextInput/NumericTextInput.tsx`
  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Updated imports to `@/shared/ui/molecules/CustomNumericKeypad` and `@/providers/ThemeProvider`.
- path: `src/shared/ui/atoms/NumericTextInput/NumericTextInput.styles.ts`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Switched to `@/theme` and typed `colors` as `Colors`.
- path: `src/shared/ui/atoms/NumericTextInput/index.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Barrel verified; no change needed.

- path: `src/shared/ui/atoms/ProgressBar/ProgressBar.tsx`
  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Verified a11y and animation logic; no code changes required.
- path: `src/shared/ui/atoms/ProgressBar/index.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Barrel verified; no change needed.

- path: `src/shared/ui/atoms/ProteinCalculationCard/ProteinCalculationCard.tsx`
  - state: done
  - priority: medium
  - changeLog:
    - 2025-08-12: Standardized provider alias. Left phosphor icons. Confirmed a11y and calculation rounding.
- path: `src/shared/ui/atoms/ProteinCalculationCard/ProteinCalculationCard.styles.ts`
  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Switched to `@/theme` and typed `colors` as `Colors`.
- path: `src/shared/ui/atoms/ProteinCalculationCard/index.ts`

  - state: done
  - priority: low
  - changeLog:
    - 2025-08-12: Barrel verified; no change needed.

- path: `src/shared/ui/atoms/RadialProgressBar/RadialProgressBar.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/atoms/RadialProgressBar/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/Skeleton/Skeleton.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/Skeleton/Skeleton.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/Skeleton/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/StatusIcon/StatusIcon.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/StatusIcon/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/Stepper/Stepper.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/Stepper/Stepper.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/Stepper/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/TextInput/TextInput.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/atoms/TextInput/TextInput.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/TextInput/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/Toggle/Toggle.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/Toggle/Toggle.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/Toggle/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/index.ts`
  - state: open
  - priority: low
  - changeLog: []

### Shared UI - Molecules & Components

- path: `src/shared/ui/molecules/CalculationInfoCard/CalculationInfoCard.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/CalculationInfoCard/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/CalorieCalculatorModal/CalorieCalculatorModal.tsx`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/shared/ui/molecules/CalorieCalculatorModal/CalorieCalculatorModal.styles.ts`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/CalorieCalculatorModal/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/CustomNumericKeypad/CustomNumericKeypad.tsx`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/shared/ui/molecules/CustomNumericKeypad/CustomNumericKeypad.styles.ts`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/CustomNumericKeypad/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/DailyProgressSummary/DailyProgressSummary.tsx`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/shared/ui/molecules/DailyProgressSummary/DailyProgressSummary.styles.ts`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/DailyProgressSummary/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/DailySummaryCard/DailySummaryCard.tsx`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/shared/ui/molecules/DailySummaryCard/DailySummaryCard.styles.ts`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/DailySummaryCard/DailyMacroBars.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/DailySummaryCard/index.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/DailySummaryCard/useMacroPercentages.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/DescriptionSkeleton/DescriptionSkeleton.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/DescriptionSkeleton/DescriptionSkeleton.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/DescriptionSkeleton/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/ExpandableFAB/ExpandableFAB.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/ExpandableFAB/ExpandableFAB.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/ExpandableFAB/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/FavoritesPickerModal/FavoritesPickerModal.tsx`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/shared/ui/molecules/FavoritesPickerModal/FavoritesPickerModal.styles.ts`

  - state: open
  - priority: medium
  - changeLog: []

- path: `src/shared/ui/molecules/FormField/FormField.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/FormField/FormField.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/FormField/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/MacroRow/MacroRow.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/MacroRow/MacroRow.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/MacroRow/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/MonthPicker/MonthPicker.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/MonthPicker/MonthPicker.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/MonthPicker/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/NutritionGrid/NutritionGrid.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/NutritionGrid/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/PageHeader/PageHeader.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/PageHeader/PageHeader.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/PageHeader/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/ProgressRing/ProgressRing.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/ProgressRing/ProgressRing.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/ProgressRing/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/ProteinCalculatorModal/ProteinCalculatorModal.tsx`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/shared/ui/molecules/ProteinCalculatorModal/ProteinCalculatorModal.styles.ts`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/ProteinCalculatorModal/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/SettingCard.tsx`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/SettingsSection.tsx`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/SkeletonCard/SkeletonCard.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/SkeletonCard/SkeletonCard.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/SkeletonCard/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/StepHeader/StepHeader.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/StepHeader/StepHeader.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/StepHeader/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/molecules/TargetInput/TargetInput.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/molecules/TargetInput/TargetInput.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/TargetInput/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/components/SearchBar/SearchBar.tsx`

  - state: open
  - priority: medium
  - changeLog: []

- path: `src/shared/ui/components/SwipeToDelete.tsx`

  - state: open
  - priority: medium
  - changeLog: []

- path: `src/shared/ui/components/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/index.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/index.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/index.ts`
  - state: open
  - priority: low
  - changeLog: []

### Feature: Food Logging

- path: `src/features/food-logging/index.ts`

  - state: open
  - priority: medium
  - changeLog: []

- path: `src/features/food-logging/utils.ts`

  - state: open
  - priority: high
  - changeLog: []
  - notes: Extract pure utility functions; ensure test coverage.

- path: `src/features/food-logging/hooks/index.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/features/food-logging/hooks/useCreateFoodLog.ts`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/features/food-logging/hooks/useFoodLogModal.ts`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/features/food-logging/hooks/useFoodLogs.ts`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/features/food-logging/hooks/useNutritionEstimation.ts`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/features/food-logging/hooks/useUpdateFoodLog.ts`

  - state: open
  - priority: high
  - changeLog: []

- path: `src/features/food-logging/ui/FoodLogScreen.tsx`

  - state: open
  - priority: high
  - changeLog: []
  - notes: Split presentation vs. container; offload business logic to hooks/utils.

- path: `src/features/food-logging/ui/FoodLogCard.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/features/food-logging/ui/FoodLogCard.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/features/food-logging/ui/FoodLogCardSkeleton.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/features/food-logging/ui/FoodLogCardView.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/features/food-logging/ui/FoodLogModal.tsx`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/features/food-logging/ui/FoodLogModal.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/features/food-logging/ui/FoodLogScreen.styles.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/features/food-logging/ui/hooks/useAudioRecording.ts`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/features/food-logging/ui/hooks/useDateNavigation.ts`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/features/food-logging/ui/hooks/useFavoriteSelection.ts`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/features/food-logging/ui/hooks/useFoodLogForm.ts`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/features/food-logging/ui/hooks/useFoodLogValidation.ts`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/features/food-logging/ui/hooks/useTabBarSpacing.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/features/food-logging/ui/components/CaloriesSection.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/features/food-logging/ui/components/MacronutriensSection.tsx`

  - state: open
  - priority: medium
  - changeLog: []

- path: `src/features/food-logging/ui/components/DateNavigationHeader/DateNavigationHeader.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/features/food-logging/ui/components/DateNavigationHeader/DateNavigationHeader.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/features/food-logging/ui/components/DateNavigationHeader/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/features/food-logging/ui/components/FoodImageDisplay/FoodImageDisplay.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/features/food-logging/ui/components/FoodImageDisplay/FoodImageDisplay.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/features/food-logging/ui/components/FoodImageDisplay/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/features/food-logging/ui/components/FoodLogFormFields/FoodLogFormFields.tsx`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/features/food-logging/ui/components/FoodLogFormFields/FoodLogFormFields.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/features/food-logging/ui/components/FoodLogFormFields/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/features/food-logging/ui/components/FoodLogsList/FoodLogsList.tsx`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/features/food-logging/ui/components/FoodLogsList/FoodLogsList.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/features/food-logging/ui/components/FoodLogsList/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/features/food-logging/ui/components/ModalHeader/ModalHeader.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/features/food-logging/ui/components/ModalHeader/ModalHeader.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/features/food-logging/ui/components/ModalHeader/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/features/food-logging/ui/FavoriteCard.tsx`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/features/food-logging/ui/index.ts`
  - state: open
  - priority: low
  - changeLog: []

### Feature: Image Capture

- path: `src/features/image-capture/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/features/image-capture/hooks/index.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/features/image-capture/hooks/useImageCapture.ts`

  - state: open
  - priority: high
  - changeLog: []

- path: `src/features/image-capture/ui/index.ts`
  - state: open
  - priority: low
  - changeLog: []

### Feature: Settings

- path: `src/features/settings/ui/components/AccordionItem.tsx`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/features/settings/ui/molecules/AppearanceCard/AppearanceCard.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/features/settings/ui/molecules/AppearanceCard/AppearanceCard.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/features/settings/ui/molecules/AppearanceCard/index.ts`

  - state: open
  - priority: low
  - changeLog: []

- path: `src/features/settings/ui/molecules/NutritionAccordionContent.tsx`

  - state: open
  - priority: medium
  - changeLog: []

- path: `src/features/settings/hooks/useKeyboardOffset.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/features/settings/hooks/useNutritionCalculations.ts`
  - state: open
  - priority: high
  - changeLog: []
- path: `src/features/settings/hooks/useSettingsModals.ts`
  - state: open
  - priority: medium
  - changeLog: []

### Shared Feature Indexes

- path: `src/shared/ui/index.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/components/index.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/index.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/molecules/index.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/index.ts`
  - state: open
  - priority: low
  - changeLog: []

### Utilities

- path: `src/utils/calculateCalories.tsx`

  - state: open
  - priority: high
  - changeLog: []
  - notes: Ensure pure and tested; no UI concerns.

- path: `src/utils/nutritionCalculations.ts`
  - state: open
  - priority: high
  - changeLog: []
  - notes: Ensure pure and tested; shared across features.

### Supabase Functions

- path: `supabase/functions/image-estimation/index.ts`

  - state: open
  - priority: high
  - changeLog: []
  - notes: Validate input/output types; security and error handling.

- path: `supabase/functions/text-estimation/index.ts`

  - state: open
  - priority: high
  - changeLog: []

- path: `supabase/functions/transcribe-audio/index.ts`

  - state: open
  - priority: high
  - changeLog: []

- path: `supabase/edgefunctions/image-estimation.ts`

  - state: open
  - priority: medium
  - changeLog: []

- path: `supabase/edgefunctions/text-estimation.ts`
  - state: open
  - priority: medium
  - changeLog: []

### Feature: Food Logging (Extras)

- path: `src/features/food-logging/ui/index.ts`
  - state: open
  - priority: low
  - changeLog: []

### Misc

- path: `open_stuff.md`
  - state: open
  - priority: low
  - changeLog: []

---

Refactoring journal (append newest first)

- 2025-08-12: Root/App Shell consolidated to Expo Router. Removed `App.tsx`, `index.ts`, `src/App.tsx`. Moved providers to `app/_layout.tsx`.
- 2025-08-12: Created initial RefactoringState.md with full inventory and global TODOs.
