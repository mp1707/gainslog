// DropZones.styles.ts

import { StyleSheet } from "react-native";
import type { Colors, ColorScheme, Theme } from "@/theme";

export const createStyles = (
  colors: Colors,
  theme: Theme,
  colorScheme: ColorScheme
) => {
  const isDarkMode = colorScheme === "dark";
  // Define base and active colors for the material effect
  const itemBackgroundColor = isDarkMode
    ? "rgba(255, 255, 255, 0.12)" // Dark mode: light translucent color
    : "rgba(255, 255, 255, 0.7)"; // Light mode: thicker material feel

  const itemActiveBackgroundColor = isDarkMode
    ? "rgba(255, 255, 255, 0.22)" // Brighter when pressed
    : "rgba(255, 255, 255, 1)"; // Fully opaque white when pressed
  return StyleSheet.create({
    // --- Overlay and Container ---
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    dropZonesContainer: {
      flex: 1,
      justifyContent: "flex-end", // Position actions near the bottom, above FAB
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xxl * 2, // Ample space above bottom safe area/tab bar
    },

    // --- Action Group Styling (Replaces large cards) ---
    actionGroupContainer: {
      borderRadius: theme.spacing.lg, // Rounded corners for the entire group (16px)
      overflow: "hidden", // Clip child items to group's border radius
      // Add subtle shadow for depth, similar to native context menus
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 8,
      height: "30%",
    },

    // --- Individual Item Styling ---
    dropZoneItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.md, // 16px vertical padding
      paddingHorizontal: theme.spacing.lg, // 20px horizontal padding
      backgroundColor: itemBackgroundColor, // Set in createStyles logic
      flex: 1,
    },
    topItem: {
      borderTopLeftRadius: theme.spacing.lg,
      borderTopRightRadius: theme.spacing.lg,
    },
    bottomItem: {
      borderBottomLeftRadius: theme.spacing.lg,
      borderBottomRightRadius: theme.spacing.lg,
    },

    // --- Content Layout ---
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDarkMode ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.05)",
      marginRight: theme.spacing.md,
    },
    textContainer: {
      flex: 1,
      justifyContent: "center",
    },

    // --- Divider ---
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: theme.spacing.lg + 40 + theme.spacing.md, // Align with text start: padding + icon width + icon margin
    },

    // --- For color interpolation ---
    itemBackgroundColor: { color: itemBackgroundColor },
    itemActiveBackgroundColor: { color: itemActiveBackgroundColor },
  });
};
