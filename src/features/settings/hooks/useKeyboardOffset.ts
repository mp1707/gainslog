import { Platform, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Hook to calculate the proper keyboard vertical offset for screens with tab bar
 * Accounts for safe area insets and tab bar height
 */
export const useKeyboardOffset = (hasTabBar: boolean = false) => {
  const insets = useSafeAreaInsets();

  // Default tab bar height on iOS and Android
  const TAB_BAR_HEIGHT = Platform.select({
    ios: 49, // Standard iOS tab bar height
    android: 56, // Material Design bottom navigation height
    default: 50,
  });

  // Calculate offset based on platform and components
  const calculateOffset = () => {
    let offset = 0;

    // Add top safe area (status bar, notch, etc.)
    offset += insets.top;

    // Add tab bar height if present
    if (hasTabBar) {
      offset += TAB_BAR_HEIGHT;
    }

    // Platform-specific adjustments
    if (Platform.OS === "android") {
      // Android might need additional offset for certain devices
      offset += 10;
    }

    return offset;
  };

  return calculateOffset();
};
