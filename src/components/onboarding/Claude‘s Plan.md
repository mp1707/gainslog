# Onboarding Flow Refactoring Plan

## Critical Issues Identified

### 1. **RulerPicker Scroll Collision** 🔴

- **Problem**: OnboardingScreen wraps ALL content in KeyboardAwareScrollView, causing conflict with RulerPicker's horizontal scroll
- **Impact**: Vertical scroll gestures interfere with ruler swiping; if user scrolls even 1px vertically, swipe becomes unresponsive
- **Current hitSlop**: `{ top: 80, bottom: 80 }` - insufficient

### 2. **Navigation Performance Issues** 🔴

- **Problem**: useNavigationGuard has 300ms minDelay + complex scheduling logic
- **Impact**: Inconsistent navigation timing - sometimes fast, sometimes delayed
- **Root cause**: Over-aggressive guard meant to prevent double-taps

### 3. **Code Quality Issues** 🟡

- Unused imports (ModalHeader, unused router methods in sex.tsx, protein-goal.tsx)
- Inconsistent React.memo usage (only sex.tsx)
- Duplicate local state mirroring store state
- Inconsistent haptic feedback timing

## Refactoring Approach

### Phase 1: Fix RulerPicker Interaction (Priority 1)

1. **OnboardingScreen.tsx**: Add optional `scrollEnabled` prop (default: true)
2. **height.tsx & weight.tsx**: Set `scrollEnabled={false}` to prevent scroll conflicts
3. **RulerPicker.tsx**: Increase hitSlop to `{ top: 120, bottom: 120, left: 20, right: 20 }`
4. **RulerPicker.tsx**: Make the entire picker container more touch-responsive

### Phase 2: Optimize Navigation Performance (Priority 1)

1. **useNavigationGuard.ts**: Reduce `minDelay` from 300ms → 50ms
2. **useNavigationGuard.ts**: Reduce `MAX_WAIT` from 1200ms → 600ms
3. Simplify scheduling logic for more consistent behavior
4. Keep lock mechanism but reduce overhead

### Phase 3: Code Cleanup & Standardization (Priority 2)

**All Onboarding Screens**:

- Remove unused imports (ModalHeader, router methods)
- Remove unnecessary React.memo from sex.tsx
- Standardize haptic feedback to `Haptics.ImpactFeedbackStyle.Medium`
- Remove duplicate local state where possible
- Ensure consistent styling patterns

**Specific Files**:

- **age.tsx**: Clean up, standardize
- **sex.tsx**: Remove React.memo, unused imports
- **height.tsx**: Remove duplicate state, disable scroll
- **weight.tsx**: Remove duplicate state, disable scroll
- **activity-level.tsx**: Clean up, standardize
- **calorie-goal.tsx**: Clean up, standardize
- **protein-goal.tsx**: Remove unused imports
- **summary.tsx**: Clean up, standardize

### Phase 4: Layout & Structure Improvements (Priority 3)

1. Ensure consistent spacing across all screens
2. Simplify conditional logic where possible
3. Improve TypeScript type definitions
4. Standardize error handling

## Expected Outcomes

✅ No more scroll collision on height/weight screens  
✅ Smooth, responsive ruler swiping with extended hit area  
✅ Consistent, snappy navigation (no more delay variance)  
✅ Clean, maintainable codebase with consistent patterns  
✅ Better user experience throughout the flow
