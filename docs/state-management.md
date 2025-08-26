# State Management Architecture

This document provides a comprehensive analysis of the Zustand and AsyncStorage system implemented in Gainslog. It serves as the definitive reference for code reviewers to evaluate whether new features follow established architectural patterns or represent uncoordinated implementations that violate the project's state management principles.

## Table of Contents

1. [Core Architecture Overview](#core-architecture-overview)
2. [Store Composition & Middleware Stack](#store-composition--middleware-stack)
3. [Slice-Based Domain Architecture](#slice-based-domain-architecture)
4. [AsyncStorage Persistence Strategy](#asyncstorage-persistence-strategy)
5. [UI Coordination & Trigger System](#ui-coordination--trigger-system)
6. [Computed Selectors & Derived State](#computed-selectors--derived-state)
7. [Cross-Slice Communication Patterns](#cross-slice-communication-patterns)
8. [Hook Integration Architecture](#hook-integration-architecture)
9. [Type Safety & Interface Design](#type-safety--interface-design)
10. [Code Review Guidelines](#code-review-guidelines)
11. [Anti-Patterns & Violations](#anti-patterns--violations)

---

## Core Architecture Overview

### Architectural Philosophy

The state management system follows a **modular, slice-based architecture** with clear separation of concerns:

- **Domain Slices**: Each feature area (food logs, favorites, user settings, weight logs) exists as an independent slice
- **UI Coordination Layer**: Centralized trigger system for component coordination
- **Persistence Layer**: Smart AsyncStorage integration with selective rehydration
- **Computed State**: In-store derived state with optimized selectors
- **Hook Abstraction**: Custom hooks that encapsulate store logic and provide component-friendly APIs

### Key Principles

1. **Single Source of Truth**: All application state flows through the central Zustand store
2. **Immutable Updates**: All state mutations use Immer for safe, trackable changes
3. **Selective Persistence**: Only relevant state persists; temporary UI state excluded
4. **Domain Isolation**: Slices are self-contained but can communicate through well-defined interfaces
5. **Performance Optimization**: Memoized selectors and computed state prevent unnecessary re-renders

---

## Store Composition & Middleware Stack

### Main Store Structure (`src/store/index.ts`)

```typescript
export type AppStore = FoodLogsSlice & 
  FavoritesSlice & 
  UserSettingsSlice & 
  WeightLogsSlice & {
    // UI Coordination Layer
    triggerAction: "manual" | "camera" | "library" | "audio" | "favorites" | null;
    triggerManualLog: () => void;
    triggerCameraCapture: () => void;
    triggerLibraryCapture: () => void;
    triggerAudioCapture: () => void;
    triggerFavorites: () => void;
    clearTrigger: () => void;
  };
```

### Middleware Stack Configuration

```typescript
export const useAppStore = create<AppStore>()(
  persist(
    immer((set, get, store) => ({
      // Slice composition with proper middleware typing
      ...createFoodLogsSlice(set, get, store),
      ...createFavoritesSlice(set, get, store),
      ...createUserSettingsSlice(set, get, store),
      ...createWeightLogsSlice(set, get, store),
      
      // UI coordination layer
      triggerAction: null,
      triggerManualLog: () => set(() => ({ triggerAction: "manual" })),
      // ... other trigger actions
    })),
    {
      name: "gainslog-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ /* selective persistence */ }),
      onRehydrateStorage: () => (state) => { /* rehydration logic */ },
    }
  )
);
```

**Key Architectural Elements:**

1. **Immer Integration**: All state mutations are wrapped in Immer for immutable updates
2. **Persist Middleware**: Handles AsyncStorage integration with selective serialization
3. **Type Safety**: Full TypeScript support with proper middleware annotations
4. **Composition Pattern**: Slices are composed using spread operators with proper typing

---

## Slice-Based Domain Architecture

### Slice Structure Pattern

Every domain slice follows a consistent structure:

```typescript
export interface DomainSlice {
  // State Properties
  domainData: DomainType[];
  
  // Core Actions (CRUD)
  addDomainItem: (item: DomainType) => void;
  updateDomainItem: (id: string, updates: Partial<DomainType>) => void;
  deleteDomainItem: (id: string) => void;
  
  // Query/Computed Methods
  getDomainByX: (criteria: any) => DomainType | null;
  getDomainCollection: (criteria: any) => DomainType[];
}

export const createDomainSlice: StateCreator<
  DomainSlice,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  DomainSlice
> = (set, get) => ({
  // Implementation with Immer mutations
});
```

### Domain Slice Analysis

#### 1. FoodLogsSlice (`src/store/slices/foodLogsSlice.ts`)

**Responsibilities:**
- Managing food log entries (CRUD operations)
- Date-based querying and filtering
- Daily nutritional totals calculation
- Selected date state management

**Key Methods:**
- `addFoodLog(log)`: Adds new food entry with Immer mutation
- `getLogsByDate(date)`: Computed selector for date-filtered logs
- `getDailyTotals(date)`: Aggregates nutritional values with user/AI preference hierarchy

**State Shape:**
```typescript
{
  foodLogs: FoodLog[],
  selectedDate: string, // ISO date string
}
```

**Critical Pattern: User vs. AI Data Hierarchy**
```typescript
getDailyTotals: (date) => {
  // Always prefer user values over AI-generated values
  const calories = log.userCalories ?? log.generatedCalories ?? 0;
  const protein = log.userProtein ?? log.generatedProtein ?? 0;
  // ...
}
```

#### 2. FavoritesSlice (`src/store/slices/favoritesSlice.ts`)

**Responsibilities:**
- Managing favorite food items
- Converting between FoodLog and FavoriteEntry
- Duplicate detection with normalized comparison
- Cross-slice integration with food logs

**Key Methods:**
- `toggleFavoriteForLog(foodLog)`: Smart toggle with normalized comparison
- `createLogFromFavorite(favoriteId, date)`: Creates disconnected log from favorite
- `isFavoriteForLog(foodLog)`: Checks if food log matches existing favorite

**Architectural Highlight: Disconnected Entity Pattern**
```typescript
createLogFromFavorite: (favoriteId, date) => {
  const favorite = get().favorites.find(fav => fav.id === favoriteId);
  const newLog: FoodLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    // Creates completely new entity, no foreign key relationship
    userTitle: favorite.title,
    userDescription: favorite.description,
    // ...
  };
  get().addFoodLog(newLog); // Cross-slice communication
}
```

#### 3. UserSettingsSlice (`src/store/slices/userSettingsSlice.ts`)

**Responsibilities:**
- User profile and preferences management
- BMR/TDEE calculation using Mifflin-St Jeor formula
- Daily target calculation and override management
- Settings validation and defaults

**Key Methods:**
- `calculateAndSetTargets()`: Computes daily targets from user settings
- `setDailyTargets(targets)`: Manual override of computed targets
- `resetDailyTargets()`: Clears both targets and settings

**Architectural Pattern: Computed vs. Override Values**
```typescript
calculateAndSetTargets: () => {
  const computed = calculateDailyTargets(userSettings);
  // Preserve manual overrides while filling computed values
  state.dailyTargets = {
    calories: existing.calories > 0 ? existing.calories : computed.calories,
    protein: existing.protein > 0 ? existing.protein : computed.protein,
    // ...
  };
}
```

#### 4. WeightLogsSlice (`src/store/slices/weightLogsSlice.ts`)

**Responsibilities:**
- Weight tracking with date-based entries
- One weight per date constraint enforcement
- Chronological sorting and latest weight queries

**Key Constraint: Single Weight Per Date**
```typescript
addWeightLog: (weight, date) => {
  // Remove existing log for the same date
  state.weightLogs = state.weightLogs.filter(log => log.date !== date);
  // Add new log and sort chronologically
  state.weightLogs.push(newLog);
  state.weightLogs.sort((a, b) => b.date.localeCompare(a.date));
}
```

---

## AsyncStorage Persistence Strategy

### Selective Persistence Pattern

The persistence system uses a **partialize function** to control what gets stored:

```typescript
partialize: (state) => ({
  // Persist core domain data
  foodLogs: state.foodLogs,
  favorites: state.favorites,
  userSettings: state.userSettings,
  dailyTargets: state.dailyTargets,
  weightLogs: state.weightLogs,
  
  // Exclude temporary UI state
  // selectedDate: excluded (always starts with today)
  // triggerAction: excluded (temporary coordination state)
})
```

### Smart Rehydration Logic

```typescript
onRehydrateStorage: () => (state) => {
  if (state) {
    // Reset UI state to proper defaults
    state.selectedDate = new Date().toISOString().split("T")[0];
    state.triggerAction = null;
  }
}
```

**Key Principles:**
1. **Domain State Persists**: Core business data survives app restarts
2. **UI State Resets**: Temporary coordination and selection state starts fresh
3. **Date Normalization**: Selected date always starts with "today" on app launch
4. **Trigger Cleanup**: UI coordination triggers are cleared during rehydration

---

## UI Coordination & Trigger System

### Centralized Action Coordination

The trigger system provides a **publish-subscribe pattern** for coordinating actions between components:

```typescript
// Store-level triggers
triggerAction: "manual" | "camera" | "library" | "audio" | "favorites" | null;

// Action dispatchers
triggerManualLog: () => set(() => ({ triggerAction: "manual" })),
triggerCameraCapture: () => set(() => ({ triggerAction: "camera" })),
// ... other triggers

// Consumer pattern
clearTrigger: () => set(() => ({ triggerAction: null }))
```

### Component Integration Pattern

**Producer Component** (`NewLogButton`):
```typescript
const triggerManualLog = useAppStore((state) => state.triggerManualLog);
const triggerCameraCapture = useAppStore((state) => state.triggerCameraCapture);

// Dispatch actions without direct component coupling
const handleManualLog = useCallback(() => {
  triggerManualLog();
}, [triggerManualLog]);
```

**Consumer Component** (App-level coordination):
```typescript
const triggerAction = useAppStore((state) => state.triggerAction);
const clearTrigger = useAppStore((state) => state.clearTrigger);

useEffect(() => {
  switch (triggerAction) {
    case "manual":
      handleManualLog();
      clearTrigger();
      break;
    // ... other cases
  }
}, [triggerAction]);
```

**Architectural Benefits:**
1. **Decoupled Communication**: Components don't need direct references
2. **Centralized Coordination**: Complex workflows managed in one place
3. **State Persistence**: Trigger state can survive component unmounts
4. **Testable Logic**: Trigger actions can be easily unit tested

---

## Computed Selectors & Derived State

### In-Store Computed Methods

Domain slices include computed methods that derive state from the store:

```typescript
// In foodLogsSlice
getLogsByDate: (date) => {
  return get().foodLogs.filter((log) => log.date === date);
},

getDailyTotals: (date) => {
  const logs = get().getLogsByDate(date);
  return logs.reduce((totals, log) => {
    // User values take precedence over AI values
    const calories = log.userCalories ?? log.generatedCalories ?? 0;
    return { calories: totals.calories + calories, /* ... */ };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}
```

### Store-Level Convenience Selectors

The main store exports convenience selectors that combine multiple store methods:

```typescript
// Convenience selector for selected date logs
export const useSelectedDateLogs = () => {
  const selectedDate = useAppStore((state) => state.selectedDate);
  const logs = useAppStore((state) => state.getLogsByDate(selectedDate));
  return logs;
};

// Complex derived state with progress calculation
export const useSelectedDateTotals = () => {
  const selectedDate = useAppStore((state) => state.selectedDate);
  const totals = useAppStore((state) => state.getDailyTotals(selectedDate));
  const targets = useAppStore((state) => state.dailyTargets);
  
  const progress = targets ? {
    calories: (totals.calories / targets.calories) * 100,
    protein: (totals.protein / targets.protein) * 100,
    // ...
  } : null;
  
  return { totals, targets, progress };
};
```

### Hook-Based Derived State

Custom hooks extend store selectors with additional computation and memoization:

```typescript
// useDailyTotals hook with enhanced derived state
export const useDailyTotals = (date?: string): DailyTotalsResult => {
  const { selectedDate, getDailyTotals, dailyTargets } = useAppStore();
  const targetDate = date || selectedDate;
  
  const totals = useMemo(() => {
    return getDailyTotals(targetDate);
  }, [targetDate, getDailyTotals]);
  
  const progress = useMemo(() => {
    if (!dailyTargets) return null;
    return {
      calories: Math.min((totals.calories / dailyTargets.calories) * 100, 100),
      // ... capped at 100% for UI display
    };
  }, [totals, dailyTargets]);
  
  const remaining = useMemo(() => {
    if (!dailyTargets) return null;
    return {
      calories: Math.max(dailyTargets.calories - totals.calories, 0),
      // ... minimum 0 for UI display
    };
  }, [totals, dailyTargets]);
  
  return { totals, targets: dailyTargets, progress, remaining };
};
```

**Performance Patterns:**
1. **Memoization**: `useMemo` prevents recalculation on every render
2. **Selective Subscriptions**: Hooks subscribe only to needed store slices
3. **Derived State Layers**: Store → Convenience Selectors → Custom Hooks
4. **UI-Friendly Transformations**: Capping percentages, floor/ceiling values

---

## Cross-Slice Communication Patterns

### Direct Method Invocation

Slices can call methods from other slices through the `get()` function:

```typescript
// In favoritesSlice
createLogFromFavorite: (favoriteId, date) => {
  const favorite = get().favorites.find(fav => fav.id === favoriteId);
  if (!favorite) return;
  
  const newLog: FoodLog = { /* ... */ };
  
  // Cross-slice communication
  get().addFoodLog(newLog);
}
```

### Shared Interface Contracts

Slices that need to communicate define shared interfaces:

```typescript
// favoritesSlice requires addFoodLog method
export const createFavoritesSlice: StateCreator<
  FavoritesSlice & { addFoodLog: (log: FoodLog) => void }, // Interface requirement
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  FavoritesSlice
> = (set, get) => ({ /* ... */ });
```

### Data Transformation Patterns

When crossing slice boundaries, data is often transformed:

```typescript
// Converting FoodLog → FavoriteEntry (different domains)
addFavorite: (foodLog) => {
  const favorite: FavoriteEntry = {
    id: generateFavoriteId(),
    createdAt: new Date().toISOString(),
    // Transform food log data to favorite format
    title: foodLog.userTitle ?? foodLog.generatedTitle,
    description: foodLog.userDescription ?? foodLog.generatedDescription,
    // ... extract relevant nutrition data
  };
  state.favorites.push(favorite);
}
```

**Communication Principles:**
1. **Interface Contracts**: Explicit typing of cross-slice dependencies  
2. **Data Transformation**: Clean boundaries with proper format conversion
3. **One-Way Dependencies**: Avoid circular dependencies between slices
4. **Domain Integrity**: Each slice maintains its own data format and rules

---

## Hook Integration Architecture

### Store-First Approach

The architecture follows a **store-first pattern** where hooks wrap store functionality rather than maintaining separate state:

```typescript
// ❌ Bad: Hook maintaining separate state
const useMyFeature = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  // ... duplicate logic
};

// ✅ Good: Hook wrapping store logic
const useMyFeature = () => {
  const { data, addItem, updateItem } = useAppStore();
  const processedData = useMemo(() => 
    data.map(item => ({ ...item, computed: calculateValue(item) }))
  , [data]);
  
  return { data: processedData, addItem, updateItem };
};
```

### Layered Abstraction Pattern

The hook system provides multiple abstraction layers:

1. **Direct Store Access**: `useAppStore((state) => state.someSlice)`
2. **Convenience Selectors**: `useSelectedDateLogs()`, `useSelectedDateTotals()`
3. **Custom Hooks**: `useDailyTotals()`, `useDateNavigation()`
4. **Feature Hooks**: `useFoodLogModal()`, `useFoodEstimation()`

### Hook Composition Examples

**Simple Store Wrapper** (`useDateNavigation`):
```typescript
export const useDateNavigation = (): DateNavigationResult => {
  const { selectedDate, setSelectedDate } = useAppStore();
  
  const goToNext = useCallback(() => {
    const nextDate = navigateDate(selectedDate, "next");
    if (nextDate <= todayKey) {
      setSelectedDate(nextDate);
    }
  }, [selectedDate, setSelectedDate]);
  
  return {
    selectedDate,
    displayDate: formatDisplayDate(selectedDate),
    canGoNext: selectedDate < getTodayKey(),
    goToNext,
    // ... other navigation methods
  };
};
```

**Complex Business Logic Hook** (`useFoodLogModal`):
```typescript
export function useFoodLogModal(onSaveClose?: () => void): UseFoodLogModalReturn {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("edit");
  const [selectedLog, setSelectedLog] = useState<FoodLog | null>(null);
  
  // Combines local UI state with store integration
  const handleImageCaptured = (log: FoodLog) => {
    setModalMode("create");
    setSelectedLog((prev) => {
      // Defensive merge to handle async updates
      if (!prev || prev.id !== log.id) return log;
      return { ...log, ...prev };
    });
    setIsModalVisible(true);
  };
  
  return { isModalVisible, handleImageCaptured, /* ... */ };
}
```

**Performance Principles:**
1. **Memoized Callbacks**: Use `useCallback` for stable references
2. **Selective Subscriptions**: Subscribe only to needed store slices
3. **Computed Values**: Use `useMemo` for expensive calculations
4. **State Colocalization**: Keep related state together in custom hooks

---

## Type Safety & Interface Design

### Strict TypeScript Configuration

All slices use proper `StateCreator` typing with middleware annotations:

```typescript
export const createFoodLogsSlice: StateCreator<
  FoodLogsSlice,                                    // Slice interface
  [["zustand/immer", never], ["zustand/persist", unknown]], // Middleware stack
  [],                                               // Mutators
  FoodLogsSlice                                     // Return type
> = (set, get) => ({
  // Implementation
});
```

### Interface Design Patterns

**Slice Interface Structure:**
```typescript
export interface DomainSlice {
  // State properties (data)
  domainEntities: Entity[];
  
  // Actions (state mutations)
  addEntity: (entity: Entity) => void;
  updateEntity: (id: string, updates: Partial<Entity>) => void;
  deleteEntity: (id: string) => void;
  
  // Computed selectors (derived state)
  getEntityByX: (criteria: Criteria) => Entity | null;
  getEntitiesWhere: (predicate: Predicate) => Entity[];
}
```

**Cross-Slice Type Dependencies:**
```typescript
// Explicit interface requirements for cross-slice communication
export const createFavoritesSlice: StateCreator<
  FavoritesSlice & { addFoodLog: (log: FoodLog) => void },
  // ...
> = (set, get) => ({ /* ... */ });
```

**Return Type Interfaces:**
```typescript
interface DailyTotalsResult {
  totals: NutritionTotals;
  targets: DailyTargets | null;
  progress: ProgressPercentages | null;
  remaining: RemainingValues | null;
}
```

---

## Code Review Guidelines

### Evaluating Store Architecture Compliance

When reviewing state management code, check for the following architectural compliance:

#### ✅ **Proper Slice Integration**

**Good**: Following established slice pattern
```typescript
export interface NewSlice {
  newData: NewEntity[];
  addNewEntity: (entity: NewEntity) => void;
  updateNewEntity: (id: string, updates: Partial<NewEntity>) => void;
  getNewEntitiesByX: (criteria: any) => NewEntity[];
}

export const createNewSlice: StateCreator<
  NewSlice,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  NewSlice
> = (set, get) => ({
  newData: [],
  addNewEntity: (entity) => set((state) => {
    state.newData.push(entity);
  }),
  // ... proper Immer mutations
});
```

**Bad**: Direct state manipulation or wrong typing
```typescript
// ❌ Missing proper StateCreator typing
export const createBadSlice = (set, get) => ({
  data: [],
  addItem: (item) => set({ data: [...get().data, item] }), // ❌ Not using Immer
});
```

#### ✅ **Proper Hook Integration**

**Good**: Store-first hook design
```typescript
export const useFeatureData = () => {
  const { data, addItem } = useAppStore();
  
  const processedData = useMemo(() => 
    data.map(item => enhanceItem(item))
  , [data]);
  
  return { data: processedData, addItem };
};
```

**Bad**: Duplicating store logic in hooks
```typescript
// ❌ Maintaining separate state that duplicates store
export const useBadFeature = () => {
  const [data, setData] = useState([]);
  const storeData = useAppStore((state) => state.data);
  
  useEffect(() => {
    setData(storeData); // ❌ Unnecessary duplication
  }, [storeData]);
  
  return data;
};
```

#### ✅ **Proper Persistence Patterns**

**Good**: Adding new state to partialize function
```typescript
partialize: (state) => ({
  existingData: state.existingData,
  newPersistentData: state.newPersistentData, // ✅ Added to persistence
  // ❌ temporaryUIState: excluded from persistence
})
```

#### ✅ **Proper Cross-Slice Communication**

**Good**: Using interface contracts and get() method
```typescript
createSliceA: StateCreator<
  SliceA & { methodFromSliceB: (param: Type) => void },
  // ...
> = (set, get) => ({
  someAction: () => {
    get().methodFromSliceB(param); // ✅ Proper cross-slice call
  }
});
```

**Bad**: Direct component-to-component communication bypassing store
```typescript
// ❌ Props drilling or direct component references
// ❌ Context that bypasses the store
// ❌ EventEmitter or other pub-sub outside of store
```

### Performance Review Checklist

1. **Selector Optimization**: Are components using specific selectors or subscribing to entire store?
2. **Memoization**: Are expensive computations properly memoized?
3. **Immer Usage**: Are all mutations using Immer's draft state?
4. **Persistence Strategy**: Is new state properly included/excluded from persistence?

### Architecture Consistency Checklist

1. **Slice Structure**: Does new slice follow established interface patterns?
2. **TypeScript Safety**: Proper StateCreator typing with middleware annotations?
3. **Hook Abstraction**: Are hooks providing store-first abstractions?
4. **Cross-Slice Integration**: Using proper interface contracts and get() methods?
5. **UI Coordination**: Using trigger system for complex component coordination?

---

## Anti-Patterns & Violations

### ❌ **Store Architecture Violations**

**Direct State Mutation**
```typescript
// ❌ Violates immutable update pattern
addItem: (item) => {
  get().items.push(item); // Direct mutation
}

// ✅ Correct: Using Immer
addItem: (item) => set((state) => {
  state.items.push(item); // Immer draft mutation
})
```

**Bypassing Store for State**
```typescript
// ❌ Component maintaining state that should be in store
const MyComponent = () => {
  const [localData, setLocalData] = useState([]); // Should be in store
  
  // ❌ Local state that other components need
  // ❌ State that should persist
  // ❌ Complex business logic in component
};
```

**Improper Slice Dependencies**
```typescript
// ❌ Circular dependencies between slices
// ❌ Hard-coded references to other slices without interface contracts
// ❌ Accessing store state directly in slice implementations
```

### ❌ **Hook Integration Violations**

**State Duplication**
```typescript
// ❌ Hook duplicating store logic
const useBadHook = () => {
  const storeData = useAppStore(state => state.data);
  const [processedData, setProcessedData] = useState([]);
  
  useEffect(() => {
    setProcessedData(processData(storeData)); // ❌ Should use useMemo
  }, [storeData]);
};
```

**Missing Memoization**
```typescript
// ❌ Expensive computation without memoization
const ExpensiveComponent = () => {
  const data = useAppStore(state => state.data);
  const result = expensiveCalculation(data); // ❌ Recalculates every render
  
  // ✅ Should be: useMemo(() => expensiveCalculation(data), [data])
};
```

### ❌ **Persistence Violations**

**Persisting Temporary State**
```typescript
partialize: (state) => ({
  // ❌ These should NOT be persisted
  currentModalState: state.currentModalState,
  temporaryFormData: state.temporaryFormData,
  uiLoadingStates: state.uiLoadingStates,
  
  // ✅ These should be persisted
  userPreferences: state.userPreferences,
  savedData: state.savedData,
})
```

**Missing Rehydration Logic**
```typescript
// ❌ Not resetting UI state during rehydration
onRehydrateStorage: () => (state) => {
  // Missing: Reset temporary states
  // Missing: Validate persisted data
  // Missing: Set proper defaults
}
```

### ❌ **Cross-Component Communication Violations**

**Direct Component Coupling**
```typescript
// ❌ Props drilling for store actions
<ParentComponent onAction={handleAction}>
  <ChildComponent onAction={handleAction}>
    <GrandchildComponent onAction={handleAction} />
  </ChildComponent>
</ParentComponent>

// ✅ Should use: Store triggers or direct store access
```

**Bypassing Trigger System**
```typescript
// ❌ Direct component references
const componentRef = useRef();
componentRef.current.doSomething();

// ❌ External event systems
eventEmitter.emit('action');

// ✅ Should use: Store trigger system
triggerAction();
```

### Identifying "Uncoordinated Convoluted Mess"

A feature implementation qualifies as an "uncoordinated convoluted mess" if it exhibits:

1. **Multiple State Sources**: Component state + store + context + external systems
2. **Inconsistent Patterns**: Some data in store, some in component state, some in refs
3. **Direct Component Coupling**: Passing callbacks through multiple component layers
4. **Missing Persistence Strategy**: No consideration for what should/shouldn't persist
5. **Performance Issues**: No memoization, excessive re-renders, inefficient selectors
6. **Type Safety Violations**: `any` types, missing interfaces, improper StateCreator usage
7. **Architecture Bypassing**: Creating new patterns instead of following established ones

### Remediation Strategies

When encountering violations:

1. **Extract to Store**: Move component state to appropriate store slice
2. **Follow Slice Pattern**: Implement proper StateCreator interfaces and Immer mutations
3. **Create Custom Hooks**: Abstract store access with proper memoization
4. **Update Persistence**: Add new state to partialize function appropriately  
5. **Use Trigger System**: Replace direct component communication with store triggers
6. **Add TypeScript**: Proper interfaces and StateCreator typing
7. **Performance Audit**: Add memoization and optimize selectors

---

## Conclusion

This state management architecture provides a robust, scalable foundation for the Gainslog application. The key to maintaining code quality is ensuring that all new features follow the established patterns:

- **Store-First**: All significant state lives in the Zustand store
- **Slice-Based**: Domain logic is properly separated into cohesive slices
- **Type-Safe**: Full TypeScript support with proper middleware typing
- **Performance-Optimized**: Memoization, selective subscriptions, and computed state
- **Persistent-Aware**: Proper consideration of what state should survive app restarts

Code reviewers should use this document as the definitive reference for evaluating whether new implementations align with the project's architectural principles or represent violations that need refactoring.