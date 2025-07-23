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
  calories: number;             // Final nutritional data (user input takes precedence)
  protein: number;
  carbs: number;
  fat: number;
  userCalories?: number;        // User-provided nutrition values (optional)
  userProtein?: number;
  userCarbs?: number;
  userFat?: number;
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

### Audio Recording Workflow (UI Complete)
1. **Recording Modal**: Animated interface with start/stop controls
2. **Permission Handling**: Microphone access request
3. **Audio Capture**: High-quality recording via expo-audio
4. **Placeholder Creation**: Creates skeleton food log
5. **Processing**: Currently creates placeholder (processing not implemented)

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
- ✅ **Enhanced manual food entry**: Complete with hybrid AI/manual nutrition input
- ✅ **Smart nutrition merging**: User input takes precedence over AI estimation
- ✅ **Re-estimation feature**: Add Info button triggers AI re-calculation
- ✅ **Input validation**: Comprehensive nutrition field validation
- ✅ **Local data persistence**: AsyncStorage CRUD operations with user nutrition storage
- ✅ **AI nutrition estimation**: OpenAI integration via Edge Functions (conditional)
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
- **Conditional AI calls**: AI estimation only called when nutrition data is incomplete
- **Smart caching**: User nutrition inputs preserved across re-estimations
- **Efficient validation**: Client-side validation prevents unnecessary API calls

### Security Notes
- **API keys**: Stored in environment variables
- **Anonymous access**: No user data collection
- **Local storage**: All personal data remains on device
- **Edge Functions**: Secure serverless execution environment

## Future Enhancement Areas

1. **Component Architecture**: Decompose large App.tsx into smaller components
2. **State Management**: Consider Context API or state management library  
3. **Audio Processing**: Implement speech-to-text for audio recordings
4. **Nutrition Database**: Integration with food databases (USDA, etc.) for precise nutrition data
5. **Barcode Scanning**: Add product scanning for packaged foods
6. **Nutrition Goals**: Daily/weekly nutrition targets and progress tracking
7. **Data Visualization**: Charts and graphs for nutrition trends
8. **Testing**: Add unit and integration tests
9. **Database Integration**: Optional cloud sync with user consent
10. **Offline Mode**: Enhanced offline functionality and sync
11. **Export Features**: CSV/JSON export of nutrition data
12. **Meal Planning**: Recipe creation and meal planning features