import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme";

export const useTabBarSpacing = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // Calculate platform-specific tab bar height for Expo Router
  const getTabBarHeight = () => {
    if (Platform.OS === "ios") {
      // iOS tab bar: 49px standard height + bottom safe area
      return 49 + insets.bottom;
    } else {
      // Android tab bar: 56px standard height
      return 56;
    }
  };

  // Calculate dynamic bottom padding
  // Tab bar height + FAB spacing + extra clearance for comfortable scrolling
  const tabBarHeight = getTabBarHeight();
  const dynamicBottomPadding =
    tabBarHeight + theme.spacing.lg + theme.spacing.md;

  return {
    tabBarHeight,
    dynamicBottomPadding,
  };
};
