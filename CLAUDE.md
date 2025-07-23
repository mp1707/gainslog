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

## Project Overview

**GainsLog** is a React Native/Expo food logging application that enables users to track nutrition through multiple input methods:
- **Photo Capture**: Take pictures of food with camera integration
- **Audio Recording**: Voice-to-text food logging (UI implemented, processing pending)
- **Manual Entry**: Text-based food description and editing
- **AI Nutrition Estimation**: OpenAI-powered nutritional analysis
- **Local Storage**: All data stored locally on device using AsyncStorage

## Architecture

### Tech Stack
- **Frontend**: React Native (0.79.5) with Expo (~53.0.20)
- **Backend**: Supabase (Edge Functions + File Storage)
- **AI**: OpenAI GPT-4o-mini for nutrition estimation
- **Language**: TypeScript with strict mode enabled
- **Storage**: AsyncStorage for local data persistence
- **Media**: expo-image-picker, expo-image-manipulator, expo-audio

### Repository Structure
```
/
├── App.tsx                 # Main application component (1,100+ lines)
├── lib/
│   ├── supabase.ts        # Supabase client & AI estimation functions
│   └── storage.ts         # AsyncStorage CRUD operations
├── components/
│   └── ImageUpload.tsx    # Reusable image upload component
├── assets/                # App icons and splash screens
├── .env                   # Supabase environment variables
└── CLAUDE.md             # This documentation
```

## Key Components

### App.tsx (Main Component)
- **Single-file architecture**: Manages entire application state and UI
- **Multi-modal input**: Camera, audio recording, and manual text entry
- **Real-time updates**: Skeleton loading states and optimistic UI updates
- **Modal management**: Food log editing and creation interfaces
- **State management**: React hooks for local state (no external state library)

### lib/supabase.ts (Backend Integration)
- **Supabase client**: Configured with AsyncStorage session persistence
- **AI estimation**: `estimateFoodAI()` function for OpenAI-based nutrition analysis
- **Anonymous access**: Uses anon key for unauthenticated API calls
- **Error handling**: Proper error boundaries with user-friendly messages

### lib/storage.ts (Data Management)
- **Local-first approach**: All data persisted via AsyncStorage
- **CRUD operations**: Create, read, update food logs
- **JSON serialization**: Structured data storage and retrieval
- **Unique IDs**: Timestamp-based identifier generation

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

2. **estimate-food-public**: Rule-based fallback estimation
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
  id: string;                    // Unique timestamp-based ID
  userTitle?: string;            // User-provided title (optional)
  userDescription?: string;      // User-provided description (optional)
  generatedTitle: string;        // AI-generated title
  estimationConfidence: number;  // AI confidence score (0-100)
  calories: number;             // Nutritional data
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;            // ISO timestamp
}
```

### API Interfaces
```typescript
interface FoodEstimateRequest {
  title: string;
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
5. **Skeleton Creation**: Immediate UI feedback with loading state
6. **AI Estimation**: Call to ai-nutrition-estimate Edge Function
7. **Data Persistence**: Save complete FoodLog to AsyncStorage
8. **UI Update**: Replace skeleton with real nutrition data

### Manual Entry Workflow
1. **Modal Interface**: Title and description input fields
2. **Validation**: Ensure title is provided
3. **AI Estimation**: Direct call to nutrition estimation API
4. **Error Handling**: "Oops! Something went wrong." on failure
5. **Data Storage**: Save to AsyncStorage on success
6. **State Update**: Add to food logs array with real-time UI update

### Audio Recording Workflow (UI Complete)
1. **Recording Modal**: Animated interface with start/stop controls
2. **Permission Handling**: Microphone access request
3. **Audio Capture**: High-quality recording via expo-audio
4. **Placeholder Creation**: Creates skeleton food log
5. **Processing**: Currently creates placeholder (processing not implemented)

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
- ✅ **Photo capture and upload**: Fully implemented
- ✅ **Manual food entry**: Complete with AI estimation
- ✅ **Local data persistence**: AsyncStorage CRUD operations
- ✅ **AI nutrition estimation**: OpenAI integration via Edge Functions
- ✅ **Image processing**: Resize, compress, and upload pipeline
- 🚧 **Audio recording**: UI complete, processing not implemented
- ❌ **Database integration**: All data stored locally only
- ❌ **User accounts**: Anonymous-only access

### Architecture Decisions
- **Single-file component**: App.tsx contains entire application logic
- **Local-first storage**: AsyncStorage over Supabase database
- **Anonymous access**: No user authentication required
- **AI-powered estimation**: OpenAI for accurate nutrition data
- **Edge Function architecture**: Serverless nutrition estimation

### Performance Considerations
- **Image compression**: Automatic optimization for mobile networks
- **Optimistic updates**: Immediate UI feedback with skeleton states
- **Local storage**: Fast data access without network dependency
- **Minimal API calls**: Only for AI estimation, everything else local

### Security Notes
- **API keys**: Stored in environment variables
- **Anonymous access**: No user data collection
- **Local storage**: All personal data remains on device
- **Edge Functions**: Secure serverless execution environment

## Future Enhancement Areas

1. **Component Architecture**: Decompose large App.tsx into smaller components
2. **State Management**: Consider Context API or state management library
3. **Audio Processing**: Implement speech-to-text for audio recordings
4. **Testing**: Add unit and integration tests
5. **Database Integration**: Optional cloud sync with user consent
6. **Offline Mode**: Enhanced offline functionality and sync
7. **Export Features**: CSV/JSON export of nutrition data