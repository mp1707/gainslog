# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gainslog is an AI-powered food tracking React Native app built with Expo. The app focuses on intelligent nutrition estimation through camera, text, and audio inputs with a clean, motivational design system called "Focused Motivation."

## Key Technologies

- **Expo Router** for file-based navigation
- **React Native** with TypeScript
- **Zustand** for state management
- **Supabase** for backend services and AI edge functions
- **Phosphor Icons** for iconography
- **React Native Reanimated** for animations

## Development Commands

```bash
# Start development server
npm start

# Run on platforms
npm run android
npm run ios
npm run web

# Supabase edge functions (if needed)
# Functions are located in supabase/functions/
```

## Architecture Overview

### Project Structure

The codebase follows a feature-based architecture with atomic design patterns:

```
src/
├── features/           # Feature modules (food-logging, image-capture)
│   └── [feature]/
│       ├── hooks/      # Business logic hooks
│       ├── ui/         # Feature-specific UI components
│       └── utils.ts    # Feature utilities
├── shared/
│   ├── ui/
│   │   ├── atoms/      # Basic UI elements (Button, TextInput)
│   │   ├── molecules/  # Composite components (FormField, ProgressRing)
│   │   └── components/ # Complex shared components
│   ├── hooks/          # Shared custom hooks
│   └── icons/          # SVG icon components
├── lib/                # External service integrations
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
└── theme.ts            # Design system theme
```

### State Management

**Central Store**: `useFoodLogStore` (Zustand) manages:
- Food logs with date-based filtering
- Action triggers for cross-screen communication
- Daily nutrition targets and progress
- Nutrition visibility preferences

**Key Patterns**:
- Optimistic UI updates with skeleton states
- Debounced auto-saving for user inputs
- Date-based filtering with local timezone handling

### Navigation

Uses Expo Router with tab-based layout:
- `app/(tabs)/index.tsx` - Today/main screen
- `app/(tabs)/overview.tsx` - Monthly overview
- `app/(tabs)/settings.tsx` - Settings screen

### AI Integration

**Supabase Edge Functions** handle AI nutrition estimation:
- `text-estimation` - Text-based food description analysis
- `image-estimation` - Image-based food recognition
- `transcribe-audio` - Audio-to-text transcription

**Estimation Flow**:
1. User inputs food data (text/image/audio)
2. Optimistic skeleton added to UI
3. AI processes input in background
4. Real data replaces skeleton when ready
5. Error handling removes skeleton if AI fails

### Custom Hooks Pattern

Business logic is encapsulated in custom hooks:
- `useCreateFoodLog` - Handles full log creation flow with AI
- `useNutritionEstimation` - Manages AI estimation process
- `useImageCapture` - Camera/library image selection
- `useFoodLogModal` - Modal state and validation

## Design System: "Focused Motivation"

### Color Palette
- **Accent**: #FF7A5A (Vibrant Coral)
- **Light Mode**: White cards on #F9F9F9 background
- **Dark Mode**: #1C1C1E cards on #000000 background

### Typography (Nunito Font)
- **Title1**: Bold 28pt - Main dashboard greeting
- **Title2**: Bold 22pt - Screen titles
- **Headline**: SemiBold 17pt - Card titles, metrics
- **Body**: Regular 17pt - Main text
- **Subhead**: Regular 15pt - Secondary info
- **Caption**: Regular 13pt - Timestamps, annotations

### Spacing (8pt Grid System)
- Base unit: 8pt
- Page margins: 20pt horizontal
- Component spacing: 8pt, 16pt, 24pt, 32pt multiples

### Components
- **Cards**: 16pt corner radius, subtle shadows in light mode
- **Buttons**: 12pt corner radius, accent color for primary actions
- **Icons**: Phosphor icons - Regular weight default, Fill weight for active states

## Important Development Patterns

### TypeScript Path Aliases
Configured in `tsconfig.json`:
```typescript
import { Button } from '@/shared/ui/atoms/Button';
import { useFoodLogStore } from '@/stores/useFoodLogStore';
import { FoodLog } from '@/types';
```

### Date Handling
All dates use local timezone ISO strings (YYYY-MM-DD format):
```typescript
// Get today's date in local timezone
const getTodayDateString = (): string => {
  const today = new Date();
  // Format as YYYY-MM-DD in local timezone
};
```

### Animation Guidelines
- Use `react-native-reanimated` for physics-based animations
- Default timing: 300ms with easeOut
- Motivational moments: 500ms with custom bezier curves
- Respect `prefers-reduced-motion` accessibility setting

### Error Handling
- AI estimation failures show toast notifications
- Optimistic UI updates are reverted on errors
- Storage errors display Alert dialogs
- Network errors are handled gracefully with retries

## Key Files to Understand

- `src/stores/useFoodLogStore.ts` - Central state management
- `src/theme.ts` - Complete design system implementation
- `src/types/index.ts` - Core TypeScript interfaces
- `src/features/food-logging/hooks/useCreateFoodLog.ts` - Main food logging flow
- `design-system.json` - Detailed design system specifications
- `architecture.md` - Explanation of provider pattern (legacy context approach)

## Development Notes

- **Feature Development**: Create new features in `src/features/[feature-name]/`
- **UI Components**: Follow atomic design - atoms → molecules → components
- **Business Logic**: Extract complex logic into custom hooks
- **Styling**: Use theme system and design tokens consistently
- **Testing**: Test hooks separately from UI components when possible
- **Performance**: Use optimistic updates for responsive user experience

## Accessibility

- All interactive elements have proper ARIA labels
- Color contrast meets WCAG 2.2 AA standards
- Animations respect motion preferences
- Focus management for keyboard navigation
- Screen reader support for all text content

## Common Tasks

- **Adding new nutrition metric**: Update `FoodLog` interface, store calculations, and UI components
- **New AI input method**: Create edge function, add to store triggers, implement UI flow
- **Design system updates**: Modify `theme.ts` and update component implementations
- **Performance optimization**: Check for unnecessary re-renders in Zustand selectors