Overview

    The app currently lacks proper keyboard handling, causing text inputs to be blocked by the on-screen keyboard. This plan implements comprehensive 
    keyboard avoidance using react-native-keyboard-controller and react-native-reanimated for smooth animations.

    Implementation Steps

    1. Install Dependencies

    - Install react-native-keyboard-controller via Expo
    - Confirm react-native-reanimated is already installed (✅ already in package.json)

    2. Provider Setup

    - Wrap the app with KeyboardProvider in app/_layout.tsx
    - Position it around the ThemeProvider for proper context hierarchy

    3. Modal Updates (Food Logging Modal)

    - Replace standard ScrollView with KeyboardAwareScrollView in FoodLogModal.tsx
    - Configure appropriate bottomOffset for safe area
    - Ensure smooth keyboard transitions with reanimated integration

    4. Settings Page Modals Updates

    - Replace ScrollView with KeyboardAwareScrollView in @src/shared/ui/molecules/ProteinCalculatorModal/ProteinCalculatorModal.tsx, @src/shared/ui/molecules/CalorieCalculatorModal/CalorieCalculatorModal.tsx  
    - Handle Stepper component interactions with keyboard
    - Maintain existing scroll behavior while adding keyboard awareness

    5. Global TextInput Enhancement

    - Update the base TextInput component to work seamlessly with keyboard controller
    - Ensure proper focus handling and keyboard type behavior

    6. Testing Considerations

    - Verify keyboard behavior across iOS and Android
    - Test with different keyboard types (numeric, default)
    - Ensure smooth animations and no jarring movements
    - Validate accessibility features remain intact

    Key Benefits

    - ✅ Smooth keyboard animations using react-native-reanimated
    - ✅ Automatic scrolling to focused inputs
    - ✅ Proper content adjustment when keyboard appears/disappears
    - ✅ Better user experience across all input screens
    - ✅ Native-like keyboard handling performance

    Files to Modify

    1. package.json - Add dependency
    2. app/_layout.tsx - Add KeyboardProvider
    3. src/features/food-logging/ui/FoodLogModal.tsx - Replace ScrollView
    4. app/(tabs)/settings.tsx - Replace ScrollView
    5. Potentially update src/shared/ui/atoms/TextInput/TextInput.tsx if needed

    This implementation follows Expo and React Native best practices while providing a modern, smooth keyboard handling experience.
