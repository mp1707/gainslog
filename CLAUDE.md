# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gainslog is an AI-powered food tracking application built with React Native and Expo Router. The app allows users to log food intake through multiple input methods (camera, audio, manual entry) and provides intelligent nutrition estimation using AI services. The app follows a "Focused Motivation" design philosophy with semantic color coding for nutritional data.

## Development Commands

```bash
# Development (with dev app variant)
npm run start:dev

# Standard development
npm start

# Platform-specific development
npm run android
npm run ios
npm run web

# Preview/Production variants
npm run start:preview
npm run start:prod
```

The app uses Expo's build variants system with different bundle IDs for dev/preview/production environments.

## Architecture Overview

### Core Stack
- **React Native 0.79.5** with React 19.0.0
- **Expo Router v5** for file-based routing with tab navigation
- **Zustand** with Immer for state management and AsyncStorage persistence
- **Supabase** for backend services and AI Edge Functions
- **TypeScript** with strict configuration and path mapping

### Project Structure
```
app/                    # Expo Router pages (file-based routing)
├── (tabs)/            # Tab navigator layout
├── food-log-detail/   # Food log detail screens
└── settings/          # Settings screens with nested navigation

src/
├── components/        # Feature-organized UI components
│   ├── shared/       # Reusable components (Button, Modal, etc.)
│   ├── daily-food-logs/  # Food logging feature components
│   ├── monthly-food-logs/ # Overview/analytics components
│   └── settings/     # Settings feature components
├── hooks/            # Custom React hooks
├── hooks-new/        # New architecture hooks
├── store/            # Zustand store slices
├── services/         # External service integrations
├── lib/             # Third-party integrations (Supabase, etc.)
├── theme/           # Design system implementation
├── utils/           # Pure utility functions
└── types/           # TypeScript type definitions
```

## Key Technologies & Patterns

### State Management - Zustand Store
The app uses a modular Zustand store with separate slices:
- `foodLogsSlice` - Food log entries and CRUD operations
- `favoritesSlice` - Favorite food items
- `userSettingsSlice` - User preferences and targets
- `weightLogsSlice` - Weight tracking data

**Key Store Features:**
- Immer integration for immutable updates
- AsyncStorage persistence with selective rehydration  
- UI trigger system for coordinating between components
- Computed selectors for daily totals and progress tracking

### Component Architecture
Components follow a **folder-per-component** pattern for complex components:
```
ComponentName/
├── ComponentName.tsx      # Main component
├── ComponentName.styles.ts # StyleSheet styles
├── index.ts              # Barrel export
├── components/           # Sub-components
└── hooks/               # Component-specific hooks
```

### Import Path Organization
The project uses extensive path mapping via TypeScript and Babel:
```typescript
// Import hierarchy (always follow this order):
// 1. React/React Native
import { useState } from "react";

// 2. Third-party libraries
import { router } from "expo-router";

// 3. Internal utils/store (@/lib, @/store, @/utils)
import { useAppStore } from "@/store";

// 4. Components (general to specific)
import { Button } from "@/components/shared";
import { FoodLogCard } from "@/components/daily-food-logs";

// 5. Types
import type { FoodLog } from "@/types";
```

## Design System Integration

### "Focused Motivation" Design System
The app implements a comprehensive design system defined in `src/theme/theme.ts`:

**Semantic Color System:**
- **Calories:** Green (`#00C853` light / `#69F0AE` dark) - Health and vitality
- **Protein:** Blue (`#2962FF` light / `#40C4FF` dark) - Strength and building  
- **Carbs:** Orange (`#FF6D00` light / `#FFAB40` dark) - Energy and fuel
- **Fat:** Yellow (`#FDB813` light / `#FFD740` dark) - Essential nutrition

**Typography:** Nunito font family with semantic scale (Title1, Title2, Headline, Body, etc.)

**Component Specifications:**
- Cards: 16pt corner radius with light mode shadows
- Buttons: 12pt corner radius with accent color (#6200EA/#7C4DFF)
- 8pt grid spacing system

## AI Integration & Services

### Nutrition Estimation
The app integrates with Supabase Edge Functions for AI-powered nutrition estimation:

**Services:**
- `image-estimation` - Analyzes food photos for nutritional content
- `text-estimation` - Processes text descriptions for nutrition data  
- `transcribe-audio` - Converts audio recordings to text

**Service Layer:**
- `NutritionEstimationService` provides clean API abstractions
- Confidence scoring and validation for AI estimates
- Error handling and fallback strategies

### Supabase Integration
- Client configuration in `src/lib/supabase.ts`
- Edge Functions for serverless AI processing
- Environment-based configuration via `src/lib/env.ts`

## Component Development Patterns

### Styling Conventions
- Use `ComponentName.styles.ts` files with React Native StyleSheet
- Follow design system tokens from theme
- Implement proper light/dark mode support
- Use semantic colors for nutrition data visualization

### Hook Patterns
The app extensively uses custom hooks for logic extraction:
- `useFoodLogModal` - Modal state management
- `useFoodEstimation` - AI estimation logic  
- `useDateNavigation` - Date picker functionality
- `useImageCapture` - Camera and gallery integration

### Modal & Navigation
- Custom `BaseModal` component with consistent behavior
- Expo Router for type-safe navigation
- Tab-based main navigation with modal overlays
- Navigation guard hooks for unsaved changes

## Development Guidelines

### TypeScript Patterns
- Strict TypeScript configuration enabled
- Comprehensive type definitions in `src/types/`
- Interface-first component props design
- Proper error boundary typing

### Testing Strategy
- Component testing for UI components
- Hook testing for custom logic
- Integration testing for store operations
- E2E testing for critical user flows

### Performance Considerations
- AsyncStorage optimization for state persistence
- Image optimization and caching strategies
- Component memoization where appropriate
- Bundle splitting via dynamic imports

## Key Files to Understand

- `src/store/index.ts` - Main store configuration and selectors
- `src/theme/theme.ts` - Complete design system implementation
- `src/hooks/useFoodLogModal.ts` - Modal coordination patterns
- `src/services/nutritionEstimation.ts` - AI service integration
- `STYLE_GUIDE.md` - Comprehensive design system documentation

This codebase emphasizes clean architecture, comprehensive typing, and sophisticated state management while maintaining excellent developer experience through well-organized imports and component structure.