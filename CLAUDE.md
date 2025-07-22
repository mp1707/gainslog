# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start Expo development server
npm start

# Start for specific platforms
npm run android    # Android emulator
npm run ios        # iOS simulator  
npm run web        # Web browser
```

Note: No linting or testing commands are configured. TypeScript compilation is handled by Expo with strict mode enabled.

## Architecture Overview

This is a React Native/Expo food logging application that allows users to:
- View food logs with nutritional information (calories, protein, carbs, fat)
- Take photos of food and upload them to Supabase storage
- Store mock food log data (real database integration not yet implemented)

### Tech Stack
- **Frontend**: React Native (0.79.5) with Expo (~53.0.20)
- **Backend**: Supabase (database + file storage)
- **Language**: TypeScript with strict mode
- **Image Processing**: expo-image-picker + expo-image-manipulator
- **Storage**: AsyncStorage for Supabase session persistence

## Key Components

### App.tsx (Main Component)
- Renders the main food log interface
- Handles camera capture and image upload workflow
- Manages food logs state (currently using mock data)
- Implements the floating add button that triggers camera

### ImageUpload.tsx (Reusable Component)
- Handles image selection from photo library
- Processes and uploads images to Supabase storage
- Located in `/components/ImageUpload.tsx`

## Supabase Integration

### Configuration
- Client configured in `/lib/supabase.ts`
- Uses environment variables from `.env`:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Storage Setup
- Images are uploaded to `food-images` bucket
- Files are resized to max 1000px width and compressed (0.8 quality)
- Filename format: `public/food-image-${timestamp}.jpg` or `public/image-${timestamp}.jpg`

## Data Models

### FoodLog Interface
```typescript
interface FoodLog {
  id: string;
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
```

## Image Processing Workflow

1. **Camera Capture**: Request camera permissions → launch camera
2. **Image Manipulation**: Resize to 1000px width, compress to 80% JPEG quality
3. **Upload**: Create FormData and upload to Supabase `food-images` bucket
4. **State Update**: Add new food log entry to state

## Environment Setup

Ensure `.env` file contains required Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## Development Notes

- Mock data is currently used for food logs - database integration not yet implemented
- The app uses camera permissions for photo capture and media library permissions for photo selection
- Image uploads are working but food log data persistence to Supabase database needs implementation
- The app is configured for both iOS and Android with Expo's new architecture enabled