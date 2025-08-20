import { StyleSheet } from "react-native";
import { theme } from "@/theme";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "stretch",
      height: theme.spacing.lg, // 24pt following 8pt grid system
      width: 70, // Fixed width for consistent bar size
      overflow: "hidden",
      borderRadius: theme.spacing.sm,
      minHeight: 28, // Ensure proper touch target
    },
    
    segment: {
      height: "100%",
      // Flex-based width distribution - flex value will be set dynamically
    },
    
    proteinSegment: {
      backgroundColor: colors.semantic.protein,
      transformOrigin: 'left', // Scale from left edge
    },
    
    carbsSegment: {
      backgroundColor: colors.semantic.carbs,
      transformOrigin: 'center', // Scale from center
    },
    
    fatSegment: {
      backgroundColor: colors.semantic.fat,
      transformOrigin: 'right', // Scale from right edge
    },
  });