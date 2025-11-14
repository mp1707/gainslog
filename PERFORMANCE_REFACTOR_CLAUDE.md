# Performance & Memory Leak Audit - MacroLoop

## App Setup & Context

### Tech Stack
- **Expo SDK**: 54
- **React Native**: 0.81.4
- **React**: 19.1.0 with **new React Compiler**
- **Platform**: iOS only (for now)
- **Navigation**: New native tabs (all tabs render simultaneously for smoother UX)

### Key Libraries & Patterns
- **State Management**: Zustand + AsyncStorage (@store)
- **Animations**: react-native-reanimated (use theme values!)
- **Blur Effects**: expo-blur
- **Haptics**: expo-haptics (use theme values!)
- **Icons**: lucide
- **Keyboard**: keyboard-controller
- **Navigation**: Expo Router via `useSafeRouter`
- **Styling**: Dynamic theme via theme hook, @AppText for text (use role prop)

### React 19 Compiler Considerations
The new React Compiler automatically optimizes re-renders and memoization. Key principles:
- **Don't over-memoize**: The compiler handles most optimizations
- **Avoid unnecessary useMemo/useCallback**: Only use when truly needed
- **Focus on proper cleanup**: Event listeners, subscriptions, timers
- **Component structure matters**: Keep components focused and properly scoped

## Identified Issues

### Primary Problem
**Memory Leak Symptoms**:
- Steady RAM usage increase during prolonged app use
- Particularly noticeable when:
  - Switching between dates
  - Loading more food logs
  - Navigation between tabs

### Investigation Areas
1. Food log components and data fetching
2. Event listeners and subscriptions
3. Image caching and rendering
4. FlatList/ScrollView optimization
5. State management cleanup
6. Animation cleanup
7. Timer/interval cleanup

## Progress Tracking

### Session 1: Initial Audit (2025-11-14)

#### ✅ Completed
- Created tracking document
- Comprehensive codebase exploration
- Identified all food log components
- Fixed HUD store setTimeout memory leak
- Fixed LogCard setTimeout for haptic feedback
- Added cleanup for image processing orphaned files
- Fixed DateSlider nested setTimeout leaks
- Fixed useDelayedAutofocus setTimeout leak
- Fixed ComponentsList setTimeout leak
- Reviewed all setTimeout/setInterval patterns

#### 📋 Findings Summary
**Critical Memory Leaks Fixed**: 6
**Files Modified**: 6
**Patterns Identified**: setTimeout without cleanup, nested timers, orphaned files

## Fixes Applied

### Fix #1: HUD Store setTimeout Memory Leak (CRITICAL)
**File**: `src/store/useHudStore.ts:81`
**Issue**: Every `show()` call created a setTimeout without tracking or cleanup. If HUDs were shown frequently (e.g., during rapid user interactions), hundreds of uncancelled timers could accumulate in memory.
**Solution**:
- Added `_activeTimerId` to store state to track the active timer
- Clear previous timer before creating a new one in `show()`
- Clear timer in `hide()` when manually dismissing
- Properly null out timer reference after completion
**Impact**: High - Prevents timer accumulation during normal app usage, especially in notification-heavy workflows.

### Fix #2: LogCard Haptic Feedback setTimeout Leak
**File**: `src/components/daily-food-logs/LogCard/LogCard.tsx:73-75`
**Issue**: 300ms setTimeout for haptic feedback was not tracked. If the AnimatedLogCard unmounted during the delay, the timeout would still fire and potentially cause issues.
**Solution**:
- Added `hapticTimerRef` to track the timeout
- Clear timer in useEffect cleanup function
- Null out reference after timeout completes
**Impact**: Medium - Prevents potential issues when cards are rapidly created/destroyed (e.g., during quick date switching).

### Fix #3: Image Processing Orphaned Files
**File**: `src/utils/processImage.ts`
**Issue**: If image upload to Supabase failed, the local file was already moved to permanent storage but never cleaned up, resulting in orphaned files accumulating in device storage.
**Solution**:
- Wrapped image processing in try/catch
- Track the local file reference
- If upload fails, delete the local file
- Graceful error handling for cleanup failures
**Impact**: Medium - Prevents storage bloat from failed uploads, important for long-term app health.

### Fix #4: DateSlider Nested setTimeout Leaks
**File**: `src/components/shared/DateSlider/DateSlider.tsx:182, 200`
**Issue**: When loading more weeks during scroll, nested setTimeout calls (100ms delays) were created but not tracked. The debounce timer also lacked cleanup on unmount.
**Solution**:
- Added `loadMoreTimersRef` Set to track all nested timers
- Each nested timer adds itself to the Set and removes on completion
- Added cleanup effect to clear scroll debounce timer and all load timers on unmount
**Impact**: Medium-High - DateSlider is used frequently; preventing timer accumulation during scroll operations improves stability.

### Fix #5: useDelayedAutofocus setTimeout Leak
**File**: `src/hooks/useDelayedAutofocus.ts:13-15`
**Issue**: setTimeout for delayed input focus was not tracked or cleaned up. If screen unfocused before delay completed, timeout would still fire.
**Solution**:
- Added `timeoutRef` to track the timeout
- Clear timeout in useFocusEffect cleanup function
- Null out reference after timeout completes
**Impact**: Low-Medium - Prevents potential issues during rapid navigation, ensures focus behavior is clean.

### Fix #6: ComponentsList Accept Recommendation setTimeout Leak
**File**: `src/components/refine-page/ComponentsList/ComponentsList.tsx:60`
**Issue**: 300ms setTimeout to delay data update after collapse animation was not tracked or cleaned up.
**Solution**:
- Added `acceptTimerRef` to track the timeout
- Clear any existing timer before creating new one
- Added cleanup effect to clear timer on unmount
**Impact**: Low-Medium - Prevents issues when user navigates away during recommendation acceptance animation.

## Already Well-Optimized (No Changes Needed)

### ✅ Components with Proper Cleanup
1. **navigationLock.ts** - Global navigation lock utility properly clears timers
2. **useNavigationGuard.ts** - Comprehensive timeout tracking and cleanup
3. **MacrosCard.tsx** - All setTimeout calls properly tracked and cleaned up
4. **ComponentRow.tsx** - Reset timeout properly tracked with cleanup effect
5. **calendar/index.tsx** - Month hydration timeouts cleaned up appropriately
6. **RevenueCat listeners** - Properly unsubscribed in cleanup
7. **Speech recognition** - All event listeners properly removed on unmount
8. **Image accessibility listener** - Unsubscribed in cleanup

### ✅ Well-Optimized FlatList Implementations

#### FoodLogsList
- `initialNumToRender`: 6
- `maxToRenderPerBatch`: 8
- `windowSize`: 7
- `getItemLayout`: Fixed 120px height (prevents layout thrashing)
- `removeClippedSubviews`: true
- `scrollEventThrottle`: 16ms
- **Verdict**: Excellent configuration for food log rendering

#### DateSlider
- `initialNumToRender`: 21 (3 weeks)
- `maxToRenderPerBatch`: 7 (one week)
- `windowSize`: 2 (reduced buffer)
- `updateCellsBatchingPeriod`: 100ms
- `removeClippedSubviews`: true
- `getItemLayout`: Dynamic item width calculated from screen size
- **Verdict**: Optimized for horizontal scrolling with proper batching

#### Calendar Grid
- Lazy month hydration with 40ms delays
- Pre-computed nutrition index for O(1) lookups
- Viewability-based rendering
- **Verdict**: Smart lazy loading strategy

### ✅ Good Patterns Observed

1. **LogCard Dual-Variant System**
   - Switches from AnimatedLogCard to StaticLogCard after animations complete
   - Reduces overhead for static content
   - Clever optimization for React Native performance

2. **Pre-indexed Food Logs**
   - `foodLogsByDate` Map provides O(1) lookups
   - Prevents repeated array iterations
   - Used in DateSlider and Calendar components

3. **Memoization Strategy**
   - Components use custom comparison functions where needed
   - Not over-memoized (good for React 19 Compiler)
   - Focus on expensive computations and referential equality

4. **Image Handling**
   - Resize to 768px width before upload
   - 65% JPEG compression
   - Proper file system management (mostly - now with error handling)

---

## Best Practices for Future Development

### Memory Leak Prevention
1. Always cleanup subscriptions in useEffect return functions
2. Clear timers and intervals
3. Remove event listeners
4. Cancel pending async operations
5. Properly handle navigation cleanup

### Performance Optimization
1. Use FlatList with proper keyExtractor and getItemLayout
2. Implement proper image caching strategies
3. Avoid creating functions/objects in render
4. Use proper key props for dynamic lists
5. Leverage React Compiler instead of manual memoization

### With React 19 Compiler
- Focus on component composition over memoization
- Let the compiler handle re-render optimization
- Only use useMemo/useCallback for expensive computations or referential equality needs
- Proper dependency arrays are still important

## Expected Impact & Testing

### Memory Leak Fixes Should Address:
1. **Steady RAM increase** - Fixed timer accumulation from HUD notifications and other setTimeout calls
2. **Date switching performance** - Fixed DateSlider nested timer leaks that accumulated during scroll
3. **Food log loading** - LogCard cleanup prevents issues during rapid card creation/destruction
4. **Long sessions** - All timer cleanups prevent gradual memory accumulation

### Recommended Testing Procedure:
1. **Baseline**: Open app, note initial memory in Developer Overlay
2. **Stress Test Date Switching**:
   - Rapidly switch between dates 20-30 times
   - Note memory usage - should stabilize rather than climb
3. **Stress Test Food Logs**:
   - Create/delete multiple food logs
   - Switch dates to load different log sets
   - Memory should not accumulate with each operation
4. **Stress Test HUD Notifications**:
   - Trigger multiple notifications rapidly (save, delete, etc.)
   - Previous behavior would accumulate timers
   - Should now properly clean up
5. **Long Session Test**:
   - Use app normally for 15-30 minutes
   - Navigate between tabs, dates, create/edit logs
   - Memory should remain relatively stable

## Next Steps for Future Sessions

### Potential Further Optimizations
1. **Image Caching Strategy**
   - Consider implementing React Native Fast Image
   - Add memory cache limits
   - Implement cache eviction strategy

2. **State Persistence Optimization**
   - Review AsyncStorage write frequency
   - Consider debouncing state updates
   - Batch related state changes

3. **Animation Performance**
   - Audit all Reanimated animations for unnecessary re-runs
   - Ensure animations are properly cancelled on unmount
   - Consider reducing animation complexity for lower-end devices

4. **Bundle Size & Code Splitting**
   - Analyze bundle size
   - Consider lazy loading heavy screens
   - Review dependency tree for unused imports

5. **Native Tab Rendering**
   - Since all tabs render simultaneously, ensure each tab properly handles being backgrounded
   - Consider implementing visibility detection to pause expensive operations

### Areas Already Confirmed Optimized
- ✅ FlatList configurations
- ✅ Event listener cleanup
- ✅ Timer/setTimeout cleanup
- ✅ Image processing (with new error handling)
- ✅ Pre-indexed data lookups
- ✅ Memoization strategy

---

**Last Updated**: 2025-11-14
**Status**: Session 1 Complete - 6 Memory Leaks Fixed
**Next Review**: After user testing to verify memory improvements
