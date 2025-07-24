# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Maintenance

**IMPORTANT**: Always update this CLAUDE.md file when making significant changes to the codebase. Focus on:

### What to Document

- **Architecture changes**: New components, data models, or system patterns
- **Core functionality**: New features, workflows, or user interactions
- **API changes**: Modified interfaces, new endpoints, or integration updates
- **Development setup**: New dependencies, environment variables, or build processes
- **Data structure changes**: Updated interfaces, storage patterns, or validation rules

### What NOT to Document

- Minor bug fixes or styling adjustments
- Temporary debugging code or console logs
- Individual function implementations (unless they're core utilities)
- Detailed code snippets (prefer high-level descriptions)
- Version-specific dependency details

### Keep Documentation Concise

- Use bullet points and structured lists
- Focus on "what" and "why", not detailed "how"
- Update existing sections rather than adding redundant information
- Remove obsolete information when features are replaced
- Prioritize information that helps understand the codebase architecture

**Remember**: This documentation is consumed as context tokens. Keep it focused on essential information that helps understand and work with the codebase effectively.

## Development Philosophy

### Expo and React Native Best Practices

- **Simplicity First**: Always choose the easiest to understand solution that creates less complexity
- **Native Solutions**: Prefer Expo SDK modules over third-party libraries when available
- **Platform-Aware**: Write code that works across iOS, Android, and web when possible
- **Performance-Focused**: Consider mobile device limitations (memory, CPU, battery)
- **Clean Code**: Always delete unused code after refactoring - no dead code allowed
- **Expo-Centric**: Leverage Expo's managed workflow and development tools

### Core Principles

1. **KISS (Keep It Simple, Stupid)**: Avoid over-engineering solutions
2. **Clean Refactoring**: Remove unused imports, components, and functions immediately
3. **Mobile-First**: Design for mobile constraints and capabilities
4. **Expo Integration**: Use Expo tools and services when they provide value
5. **Readable Code**: Write code that any developer can understand quickly

## Detailed Implementation Guide

For comprehensive refactoring guidelines, component creation patterns, and step-by-step implementation protocols, see **`refactoring/CLAUDE.md`**. This detailed guide contains:

- **Refactoring Protocol**: Phase-by-phase breakdown of architecture transformation
- **Prompting Guidelines**: How to interact with AI tools for optimal results
- **Component Creation**: Atomic design implementation with StyleSheet.create
- **Feature Slicing**: Best practices for feature-based organization
- **Golden Rules**: Strict conventions for consistent codebase quality

**When to Reference**: Consult `refactoring/CLAUDE.md` when creating new features, refactoring existing code, or implementing new UI components.

## Development Commands

```bash
# Start Expo development server
npm start

# Start for specific platforms
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run web        # Web browser
```

### Expo Development Workflow

#### Debugging and Testing
- **Expo DevTools**: Access via `d` in terminal or `expo:// URLs` for remote debugging
- **React Native Debugger**: Use standalone app for advanced debugging
- **Flipper Integration**: Connect Flipper for network inspection and performance monitoring
- **Expo Go Testing**: Test on physical devices instantly with QR code scanning
- **Development Builds**: Create custom development builds for testing native modules

#### Platform-Specific Development
```bash
# Create platform-specific code when needed
# ios/android folders for native customization
# Use Platform.select() for runtime platform detection
```

#### Performance Monitoring
- **Bundle Analysis**: `npx expo bundle --platform ios --dev false --minify false`
- **Memory Profiling**: Use Expo DevTools performance tab
- **Network Monitoring**: Enable network inspector in development builds

Note: No linting or testing commands are configured. TypeScript compilation is handled by Expo with strict mode enabled.

## Project Overview

**GainsLog** is a React Native/Expo food logging application that enables users to track nutrition through multiple input methods:

- **Photo Capture**: Take pictures of food with camera integration
- **Audio Recording**: Voice-to-text food logging (feature pending)
- **Manual Entry**: Enhanced text-based food description with optional manual nutrition input
- **Hybrid AI/Manual Nutrition**: Smart combination of user input and AI estimation
- **AI Nutrition Estimation**: OpenAI-powered nutritional analysis when needed
- **Local Storage**: All data stored locally on device using AsyncStorage

## Architecture

### Tech Stack

- **Frontend**: React Native (0.79.5) with Expo (~53.0.20)
- **Backend**: Supabase (Edge Functions + File Storage)
- **AI**: OpenAI GPT-4o-mini for nutrition estimation
- **Language**: TypeScript with strict mode enabled
- **State Management**: Zustand for global state management
- **Storage**: AsyncStorage for local data persistence
- **Media**: expo-image-picker, expo-image-manipulator, expo-audio

### Architecture Pattern: Hybrid Feature-Based + Atomic Design

The codebase follows a modern hybrid approach combining:

- **Feature-Based Architecture**: Domain-specific logic grouped in feature slices
- **Atomic Design**: UI components organized by complexity (atoms → molecules → organisms)
- **Context Window Optimization**: Small, focused files (≤200 lines) for better AI collaboration
- **Co-location**: Implementation and styles kept together in feature directories

### Core Architecture Principles

1. **Context as Signal**: Break code into small, single-responsibility files (≤200 lines) with descriptive names that serve as meta-prompts
2. **Public APIs**: Each feature exports its interface via barrel files (`index.ts`) - import exclusively from these entry points
3. **Atomic Layering**: Progressive composition from atoms → molecules → organisms → templates → pages
4. **StyleSheet.create**: Classic React Native styling in dedicated `.styles.ts` files co-located with components
5. **Feature Boundaries**: Domain-specific logic grouped in feature slices under `src/features/<feature>/`
6. **Global vs Local**: Distinguish between truly global resources (`src/shared/`, `src/theme/`) and feature-specific code
7. **Co-location**: Keep implementation and styles together within feature directories for better context
8. **Cohesion over DRY**: Prefer clarity and context over avoiding minimal duplication

### Mobile-Specific Patterns

#### Expo SDK Integration
- **Expo Modules**: Always check if Expo provides a module before adding third-party dependencies
- **Expo Constants**: Use `expo-constants` for environment variables and device info
- **Expo Updates**: Leverage OTA updates for non-native code changes
- **Expo Dev Tools**: Use Expo Go, development builds, and debugging tools

#### React Native Best Practices
- **Platform Detection**: Use `Platform.OS` for platform-specific logic
- **Safe Area**: Always handle safe areas with `react-native-safe-area-context`
- **Performance**: Use `FlatList` for large lists, avoid unnecessary re-renders
- **Memory Management**: Properly clean up listeners, timers, and subscriptions
- **Navigation**: Use React Navigation for screen management and deep linking

#### Component Patterns
```typescript
// ✅ Good - Expo/React Native component structure
import { StyleSheet, Platform } from 'react-native';
import { View, Text } from 'react-native';

export function MyComponent({ data }: MyComponentProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 4 },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});
```

### Repository Structure

```
/
├── src/
│   ├── stores/                 # Zustand global state stores
│   │   └── useFoodLogStore.ts  # Main food logging state management
│   ├── app/                    # Application-wide logic
│   │   ├── providers/          # Context & state wrappers (minimal)
│   │   └── navigation/         # Root navigation stacks
│   ├── shared/                 # Truly global components and utilities
│   │   └── ui/
│   │       ├── atoms/          # Smallest UI units (Button, TextInput)
│   │       │   ├── Button/
│   │       │   │   ├── Button.tsx
│   │       │   │   ├── Button.styles.ts
│   │       │   │   └── index.ts
│   │       └── molecules/      # Composed atoms (FormField, SearchForm)
│   │           └── FormField/
│   │               ├── FormField.tsx
│   │               ├── FormField.styles.ts
│   │               └── index.ts
│   ├── features/               # Feature-based modules
│   │   └── food-logging/       # Food logging feature
│   │       ├── ui/            # Feature-specific UI components
│   │       ├── api.ts         # Feature API calls
│   │       ├── hooks.ts       # Feature custom hooks
│   │       ├── types.ts       # Feature-specific types
│   │       └── index.ts       # Public API barrel
│   ├── theme/                  # Design tokens
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   ├── types/                  # Globally shared TypeScript types
│   ├── lib/                    # Pure utility functions
│   │   ├── supabase.ts        # Supabase client & AI estimation
│   │   └── storage.ts         # AsyncStorage operations
│   └── App.tsx                 # Entry point with providers & navigation
├── assets/                     # App icons and splash screens
├── refactoring/
│   └── CLAUDE.md              # Detailed refactoring guidelines (see reference below)
├── .env                        # Supabase environment variables
└── CLAUDE.md                   # This documentation
```

## Key Components

### src/stores/useFoodLogStore.ts (Global State Management)

- **Unified state**: Combines food logs data and action triggers in single store
- **AsyncStorage integration**: Automatic persistence with local storage operations
- **Action triggers**: Global action coordination (manual/image/audio) without context drilling
- **Type safety**: Full TypeScript support with proper interfaces
- **Performance**: Minimal re-renders with granular state selection

### src/App.tsx (Application Entry Point)

- **Minimal setup**: Clean entry point with navigation configuration
- **Store initialization**: Loads food logs data on app startup via root layout
- **No provider complexity**: Simplified architecture without context providers
- **Clean separation**: No longer contains business logic, purely architectural

### src/features/food-logging/ (Core Feature Module)

- **Feature encapsulation**: All food logging logic contained within feature boundary
- **Public API**: Exports components, hooks, and types via `index.ts` barrel
- **UI components**: Screen components and feature-specific UI elements in `ui/` directory
- **Business logic**: Custom hooks in `hooks.ts`, API calls in `api.ts`
- **Type definitions**: Feature-specific TypeScript interfaces in `types.ts`

### src/shared/ui/ (Atomic Design System)

- **Atoms**: Basic building blocks (Button, TextInput, LoadingSpinner)
- **Molecules**: Composed components (FormField, NutritionGrid, FoodLogCard)
- **Co-located styles**: Each component has paired `.styles.ts` file using StyleSheet.create
- **Reusable across features**: Truly global UI components used throughout the app

### src/lib/ (Core Utilities)

- **supabase.ts**: Supabase client configuration and AI estimation functions
- **storage.ts**: AsyncStorage CRUD operations and data persistence
- **utils.ts**: Pure utility functions and helpers
- **Type-safe**: All utilities properly typed with TypeScript

### src/theme/ (Design System)

- **Design tokens**: Colors, typography, spacing, and other design constants
- **Centralized theming**: Single source of truth for visual design
- **Export structure**: Easy import and consumption across components

## Supabase Integration

### Configuration

- **Client setup**: `/lib/supabase.ts` with environment variables
- **Required env vars**:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Edge Functions (Deployed)

1. **ai-nutrition-estimate**: OpenAI-powered nutrition analysis

   - Input: `{ title: string, description?: string }`
   - Output: Nutrition data with confidence scoring
   - Model: GPT-4o-mini with structured JSON output
   - Authentication: Anonymous access with Bearer token

2. **image-based-estimation**: OpenAI Vision-powered image analysis

   - Input: `{ imageUrl: string, title?: string, description?: string }`
   - Output: Nutrition data with confidence scoring based on visual clarity
   - Model: GPT-4o Vision API with structured JSON output
   - Authentication: Anonymous access with Bearer token

3. **estimate-food-public**: Rule-based fallback estimation
   - Fallback function with keyword-based nutrition estimates
   - Used for basic estimation when AI is unavailable

### File Storage

- **Bucket**: `food-images` for photo uploads
- **Processing**: Images resized to 1000px width, 80% JPEG compression
- **Naming**: `public/food-image-${timestamp}.jpg` format
- **Upload workflow**: FormData → Supabase Storage → URL return

### Authentication Strategy

- **Anonymous access**: No user registration required
- **Local storage only**: All food logs stored on device
- **API access**: Uses anon key for Edge Function calls
- **Privacy-first**: No user data sent to external services except AI estimation

## Data Models

### FoodLog Interface

```typescript
interface FoodLog {
  id: string; // Unique timestamp-based ID
  userTitle?: string; // User-provided title (optional)
  userDescription?: string; // User-provided description (optional)
  generatedTitle: string; // AI-generated title
  estimationConfidence: number; // AI confidence score (0-100)
  calories: number; // Final nutritional data (user input takes precedence)
  protein: number;
  carbs: number;
  fat: number;
  userCalories?: number; // User-provided nutrition values (optional)
  userProtein?: number;
  userCarbs?: number;
  userFat?: number;
  imageUrl?: string; // Supabase Storage URL for captured images
  createdAt: string; // ISO timestamp
}
```

### API Interfaces

```typescript
interface FoodEstimateRequest {
  title: string;
  description?: string;
}

interface ImageEstimateRequest {
  imageUrl: string;
  title?: string;
  description?: string;
}

interface FoodEstimateResponse {
  generatedTitle: string;
  estimationConfidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
```

## Application Flow

### Photo Capture Workflow

1. **Permission Request**: Camera and media library access
2. **Image Capture**: expo-image-picker with camera interface
3. **Image Processing**: Resize and compress via expo-image-manipulator
4. **Supabase Upload**: FormData upload to food-images bucket
5. **URL Generation**: Get public URL from Supabase Storage
6. **Skeleton Creation**: Immediate UI feedback with loading state (includes imageUrl)
7. **User Enhancement**: Modal opens for optional title, description, and nutrition input
8. **Smart AI Decision**:
   - If user provides all nutrition → Skip AI, use user values (100% confidence)
   - If partial nutrition → Call image-based estimation, merge with user input
   - If no nutrition → Traditional image-based AI estimation with OpenAI Vision
9. **Data Persistence**: Save complete FoodLog with imageUrl to AsyncStorage
10. **UI Update**: Replace skeleton with real nutrition data and 📷 indicator

### Enhanced Manual Entry Workflow

1. **Modal Interface**: Title, description, and optional nutrition input fields (calories, protein, carbs, fat)
2. **Input Validation**: Title required, nutrition fields validated for numeric values and ranges
3. **Smart AI Decision**:
   - If all nutrition fields provided → Skip AI estimation, use user values (100% confidence)
   - If partial nutrition data → Call AI estimation, merge with user input (user input takes precedence)
   - If no nutrition data → Traditional AI estimation
4. **Data Merging**: `mergeNutritionData()` utility combines user input with AI estimation intelligently
5. **Error Handling**: Comprehensive validation errors and API failure handling
6. **Data Storage**: Save complete FoodLog with both user and AI data to AsyncStorage
7. **State Update**: Real-time UI updates with loading states

### Edit Mode Re-estimation (Add Info Button)

1. **Info Modal**: Pre-populated with existing user data (title, description, nutrition values)
2. **User Updates**: Modify title, description, or nutrition values as needed
3. **Forced Re-estimation**: Always triggers AI estimation with updated information
4. **Data Merging**: Combines new AI estimation with preserved user nutrition inputs
5. **Confidence Improvement**: Designed to improve low-confidence entries with additional details
6. **Real-time Feedback**: Loading states show "Re-estimating nutrition..." during processing

## Nutrition Input System

### Smart Hybrid Approach

The application uses an intelligent hybrid system that combines user input with AI estimation:

1. **User Input Priority**: Manual nutrition values always take precedence over AI estimations
2. **Conditional AI Usage**: AI estimation is only called when nutrition data is incomplete
3. **Data Validation**: Comprehensive input validation ensures data quality
4. **Transparent Storage**: Separate storage of user vs AI values for full transparency

### Nutrition Data Merging Logic

```typescript
// mergeNutritionData() utility function handles:
- Input validation (numeric, non-negative, reasonable limits)
- Smart AI decision making (skip AI if all values provided)
- Data precedence (user input overrides AI estimation)
- Error collection and reporting
- Confidence scoring based on data source
```

### Input Validation Rules

- **Numeric Format**: Must be valid decimal numbers
- **Non-negative**: All nutrition values must be ≥ 0
- **Reasonable Limits**: Maximum 10,000 for any single value
- **Optional Fields**: Empty fields are valid and trigger AI estimation
- **Error Reporting**: Clear validation messages for user feedback

### UI/UX Features

- **2x2 Grid Layout**: Clean organization of nutrition input fields
- **Contextual Hints**: "Leave fields empty to have AI estimate missing values"
- **Numeric Keyboards**: Optimized input experience on mobile
- **Loading States**: Clear feedback during AI processing
- **Error Handling**: User-friendly validation and API error messages
- **Icons**: Use @expo/vector-icons/FontAwesome for Icons
- **Animation**: Use react-native-reanimated for Animations

### React Native Technical Standards

#### Component Guidelines
```typescript
// ✅ Good - React Native component standards
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({ title, onPress, disabled = false, variant = 'primary' }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: '#007AFF',
  },
});
```

#### Accessibility Standards (WCAG 2.2 AA for Mobile)
- **Accessibility Labels**: Always provide `accessibilityLabel` for interactive elements
- **Accessibility Roles**: Use appropriate `accessibilityRole` (button, text, etc.)
- **Minimum Touch Targets**: Ensure touch targets are at least 44x44 points
- **Color Contrast**: Maintain 4.5:1 contrast ratio for text
- **Screen Reader Support**: Test with VoiceOver (iOS) and TalkBack (Android)

```typescript
// ✅ Good - Accessible component
<TouchableOpacity
  style={styles.button}
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="Add food item to your log"
  accessibilityHint="Opens the food logging form"
>
  <Text style={styles.buttonText}>Add Food</Text>
</TouchableOpacity>
```

#### Form and Input Standards
- **Keyboard Types**: Use appropriate `keyboardType` for inputs
- **Auto-complete**: Implement `textContentType` for better UX
- **Validation**: Show real-time validation feedback
- **Focus Management**: Handle keyboard and focus states properly

```typescript
// ✅ Good - Accessible form input
<TextInput
  style={styles.input}
  value={value}
  onChangeText={setValue}
  placeholder="Enter food name"
  keyboardType="default"
  textContentType="none"
  autoCapitalize="words"
  accessibilityLabel="Food name input"
  accessibilityHint="Enter the name of the food you want to log"
/>
```

## Image Processing Pipeline

1. **Source Selection**: Camera capture or photo library selection
2. **Permission Management**: Runtime permission requests
3. **Image Manipulation**:
   - Resize: Maximum 1000px width (maintains aspect ratio)
   - Compression: 80% JPEG quality for optimal file size
   - Format: Always converts to JPEG
4. **Upload Process**:
   - FormData creation with proper headers
   - Supabase Storage API integration
   - Error handling for upload failures
5. **URL Management**: Store returned public URLs for future reference

## Error Handling Strategy

### User-Facing Errors

- **AI Estimation Failure**: "Oops! Something went wrong."
- **Network Issues**: Generic error messaging
- **Permission Denied**: System-level permission dialogs

### Developer Debugging

- **Console Logging**: Detailed error information for development
- **Function Logs**: Supabase Edge Function logging for API debugging
- **Network Errors**: HTTP status codes and response text logging

## Environment Setup

### Required Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Supabase Project Setup

1. **Storage Bucket**: Create `food-images` bucket with public access
2. **Edge Functions**: Deploy `ai-nutrition-estimate` function
3. **Environment Variables**: Configure `OPENAI_API_KEY` in Supabase dashboard
4. **Anonymous Access**: Ensure anon role has function execution permissions

## Development Notes

### Current Implementation Status

- ✅ **Photo capture and upload**: Fully implemented with imageUrl storage
- ✅ **Image-based nutrition estimation**: OpenAI Vision API integration via Edge Function
- ✅ **Enhanced manual food entry**: Complete with hybrid AI/manual nutrition input
- ✅ **Smart nutrition merging**: User input takes precedence over AI estimation
- ✅ **Intelligent estimation routing**: Image-based vs text-based AI selection
- ✅ **Re-estimation feature**: Add Info button triggers appropriate AI re-calculation
- ✅ **Visual indicators**: 📷 emoji for entries with images
- ✅ **Image display**: Full images shown in details modal
- ✅ **Input validation**: Comprehensive nutrition field validation
- ✅ **Local data persistence**: AsyncStorage CRUD operations with user nutrition storage
- ✅ **AI nutrition estimation**: Dual OpenAI integration (Vision + Text) via Edge Functions
- ✅ **Image processing**: Resize, compress, and upload pipeline
- 🚧 **Audio recording**: UI complete, processing not implemented
- ❌ **Database integration**: All data stored locally only
- ❌ **User accounts**: Anonymous-only access

### Architecture Decisions

- **Zustand State Management**: Migrated from React Context to Zustand for simplified global state
  - **Rationale**: Context providers created complex prop drilling and unnecessary re-renders
  - **Benefits**: Single source of truth, better performance, simpler testing, no provider nesting
  - **Implementation**: Unified store combining food logs data + action triggers in `useFoodLogStore`
  - **Migration**: Replaced `useFoodLogs` hook + multiple providers with single Zustand store
- **Hybrid Feature-Based + Atomic Design**: Modular architecture with feature slices and atomic UI components
- **Context Window Optimization**: Small, focused files (≤200 lines) for better AI collaboration
- **Co-location Strategy**: Implementation and styles kept together in feature directories
- **Public API Pattern**: Each feature exports via barrel files for clean imports
- **Local-first storage**: AsyncStorage over Supabase database for privacy
- **Anonymous access**: No user authentication required
- **AI-powered estimation**: OpenAI for accurate nutrition data
- **Edge Function architecture**: Serverless nutrition estimation

### Performance Considerations

#### General Performance
- **Zustand performance**: Minimal re-renders with granular state selection and no context propagation
- **Unified state management**: Single store reduces complexity and improves debugging
- **Modular loading**: Feature-based architecture enables code splitting and lazy loading
- **Atomic composition**: Reusable components reduce bundle duplication
- **Context window efficiency**: Small files (≤200 lines) improve development performance with AI tools

#### Mobile-Specific Optimizations
- **Memory Management**: Always clean up event listeners, timers, and subscriptions in `useEffect` cleanup
- **List Performance**: Use `FlatList` with `getItemLayout` for large datasets, implement `keyExtractor`
- **Image Optimization**: Compress images before storage, use appropriate resizeMode
- **Bundle Size**: Monitor bundle size with Expo CLI, avoid large dependencies
- **Platform Optimization**: Use `Platform.select()` to load platform-specific code only when needed
- **Async Operations**: Use proper loading states and error boundaries for network calls
- **Navigation Performance**: Implement lazy loading for screens not immediately needed

#### Development Performance
- **Fast Refresh**: Structure components to work well with React Native's Fast Refresh
- **Expo Dev Tools**: Use Expo DevTools for debugging and performance monitoring
- **TypeScript**: Strict typing prevents runtime errors and improves development speed
- **ESLint/Prettier**: Consistent code formatting reduces cognitive load

#### App Performance
- **Image compression**: Automatic optimization for mobile networks
- **Optimistic updates**: Immediate UI feedback with skeleton states
- **Local storage**: Fast data access without network dependency
- **Conditional AI calls**: AI estimation only called when nutrition data is incomplete
- **Smart caching**: User nutrition inputs preserved across re-estimations
- **Efficient validation**: Client-side validation prevents unnecessary API calls

### Security Notes

- **API keys**: Stored in environment variables
- **Anonymous access**: No user data collection
- **Local storage**: All personal data remains on device
- **Edge Functions**: Secure serverless execution environment

## Future Enhancement Areas

1. ✅ **Component Architecture**: ~~Decompose large App.tsx into smaller components~~ - **COMPLETED** (Refactored to hybrid feature-based + atomic design)
2. ✅ **Modular Structure**: ~~Break code into focused files~~ - **COMPLETED** (Files now ≤200 lines with clear separation of concerns)
3. **Audio Processing**: Implement speech-to-text for audio recordings
4. **Nutrition Database**: Integration with food databases (USDA, etc.) for precise nutrition data
5. **Barcode Scanning**: Add product scanning for packaged foods
6. **Nutrition Goals**: Daily/weekly nutrition targets and progress tracking
7. **Data Visualization**: Charts and graphs for nutrition trends
8. **Testing**: Add unit and integration tests for atomic components and features
9. **Database Integration**: Optional cloud sync with user consent
10. **Offline Mode**: Enhanced offline functionality and sync
11. **Export Features**: CSV/JSON export of nutrition data
12. **Meal Planning**: Recipe creation and meal planning features
13. ✅ **State Management**: ~~Consider Context API or Zustand for complex state~~ - **COMPLETED** (Migrated to Zustand for simplified global state management)
14. **Design System**: Expand atomic design with more complex organisms and templates
