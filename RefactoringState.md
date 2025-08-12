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
  - state: open
  - priority: medium
  - changeLog: []
  - notes: Verify entry point consistency with `src/App.tsx`; avoid duplication, prefer a single authoritative shell.
  - dependencies: `src/App.tsx`, `app/_layout.tsx`

- path: `index.ts`
  - state: open
  - priority: low
  - changeLog: []
  - notes: Ensure clean export surface; confirm platform entry alignment.

- path: `app/_layout.tsx`
  - state: open
  - priority: medium
  - changeLog: []
  - notes: Validate navigation/container structure; ensure separation from feature screens.

- path: `app/(tabs)/_layout.tsx`
  - state: open
  - priority: medium
  - changeLog: []
  - notes: Review tab navigator config and screen registration.

- path: `app/(tabs)/index.tsx`
  - state: open
  - priority: medium
  - changeLog: []
  - notes: Home/dashboard screen wiring into features.

- path: `app/(tabs)/favorites.tsx`
  - state: open
  - priority: low
  - changeLog: []
  - notes: Ensure it uses feature-level favorites and shared UI.

- path: `app/(tabs)/overview.tsx`
  - state: open
  - priority: low
  - changeLog: []
  - notes: Confirm aggregation reads from stores/selectors.

- path: `app/(tabs)/settings.tsx`
  - state: open
  - priority: medium
  - changeLog: []
  - notes: Delegate to settings feature; no duplicated logic.

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
  - state: open
  - priority: medium
  - changeLog: []
  - notes: Ensure tokens align with `src/theme.ts` and shared UI.

- path: `src/theme.ts`
  - state: open
  - priority: medium
  - changeLog: []
  - notes: Centralize theme tokens; remove duplicated style constants elsewhere.

### Providers

- path: `src/providers/ThemeProvider.tsx`
  - state: open
  - priority: medium
  - changeLog: []
  - notes: Bridge between design tokens and component library; ensure minimal prop drilling.

### Library / Services

- path: `src/lib/storage.ts`
  - state: open
  - priority: high
  - changeLog: []
  - notes: Audit storage API surface; ensure typed keys, error handling, and SSR safety where applicable.

- path: `src/lib/supabase.ts`
  - state: open
  - priority: high
  - changeLog: []
  - notes: Centralize client init; strict types; environment handling.

- path: `src/lib/toast.ts`
  - state: open
  - priority: medium
  - changeLog: []
  - notes: Standardize UX for success/error; avoid side-effect imports.

### App Entrypoint (src)

- path: `src/App.tsx`
  - state: open
  - priority: high
  - changeLog: []
  - notes: Prevent duplication with root `App.tsx`; consolidate if both exist.

### Shared Types

- path: `src/types/index.ts`
  - state: open
  - priority: high
  - changeLog: []
  - notes: Define domain types for foods, logs, nutrition estimates; aim for feature-local types and shared primitives.

### Global Hooks

- path: `src/hooks/useFonts.ts`
  - state: open
  - priority: low
  - changeLog: []
  - notes: Verify loading states and error handling.

- path: `src/hooks/index.ts`
  - state: open
  - priority: low
  - changeLog: []

### Global Components

- path: `src/components/AppText.tsx`
  - state: open
  - priority: medium
  - changeLog: []
  - notes: Ensure consistent typography system usage.

- path: `src/components/Button.tsx`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/components/Card.tsx`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/components/FilterBadge.tsx`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/components/ProgressRow.tsx`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/components/SemanticBadge.tsx`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/components/ShimmerEffect.tsx`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/components/SkeletonShimmerEffect.tsx`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/components/index.ts`
  - state: open
  - priority: low
  - changeLog: []

### State Stores

- path: `src/stores/useFavoritesStore.ts`
  - state: open
  - priority: medium
  - changeLog: []
  - notes: Ensure selectors and immutability; avoid over-rendering.

- path: `src/stores/useFoodLogStore.ts`
  - state: open
  - priority: high
  - changeLog: []
  - notes: Normalize entities; derive selectors for computed state.

### Shared Icons

- path: `src/shared/icons/ArrowLeftIcon.tsx`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/icons/ArrowRightIcon.tsx`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/icons/CalendarIcon.tsx`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/icons/CameraIcon.tsx`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/icons/PencilIcon.tsx`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/icons/SettingsIcon.tsx`
  - state: open
  - priority: low
  - changeLog: []

### Shared UI - Atoms

- path: `src/shared/ui/atoms/AnimatedCalculatorButton/AnimatedCalculatorButton.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/AnimatedCalculatorButton/AnimatedCalculatorButton.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/AnimatedCalculatorButton/index.ts`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/Badge/Badge.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/Badge/Badge.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/Badge/index.ts`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/Button/Button.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/atoms/Button/Button.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/Button/index.ts`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/CalorieCalculationCard/CalorieCalculationCard.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/atoms/CalorieCalculationCard/CalorieCalculationCard.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/CalorieCalculationCard/index.ts`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/FlowArrow/FlowArrow.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/FlowArrow/FlowArrow.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/FlowArrow/index.ts`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/GoalSelectionCard/GoalSelectionCard.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/atoms/GoalSelectionCard/GoalSelectionCard.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/GoalSelectionCard/index.ts`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/ImageSkeleton/ImageSkeleton.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/ImageSkeleton/index.ts`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/InlineRecordButton/InlineRecordButton.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/atoms/InlineRecordButton/InlineRecordButton.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/InlineRecordButton/index.ts`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/LoadingSpinner/LoadingSpinner.tsx`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/LoadingSpinner/index.ts`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/ManualEntryButton/ManualEntryButton.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/atoms/ManualEntryButton/ManualEntryButton.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/ManualEntryButton/index.ts`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/NumericTextInput/NumericTextInput.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/atoms/NumericTextInput/NumericTextInput.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/NumericTextInput/index.ts`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/ProgressBar/ProgressBar.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/atoms/ProgressBar/index.ts`
  - state: open
  - priority: low
  - changeLog: []

- path: `src/shared/ui/atoms/ProteinCalculationCard/ProteinCalculationCard.tsx`
  - state: open
  - priority: medium
  - changeLog: []
- path: `src/shared/ui/atoms/ProteinCalculationCard/ProteinCalculationCard.styles.ts`
  - state: open
  - priority: low
  - changeLog: []
- path: `src/shared/ui/atoms/ProteinCalculationCard/index.ts`
  - state: open
  - priority: low
  - changeLog: []

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
- 2025-08-12: Created initial RefactoringState.md with full inventory and global TODOs.


