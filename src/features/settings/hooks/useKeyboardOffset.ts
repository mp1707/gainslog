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

    // For tab bar screens, we only need minimal offset
    if (hasTabBar) {
      // Just account for the tab bar height, not safe areas
      offset = Platform.select({
        ios: 10, // Minimal offset for iOS
        android: 15, // Slightly more for Android
        default: 10,
      });
    } else {
      // For modals, no offset needed
      offset = 0;
    }

    return offset;
  };

  return calculateOffset();
};
