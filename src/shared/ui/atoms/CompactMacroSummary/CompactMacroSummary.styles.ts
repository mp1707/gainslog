import { StyleSheet } from "react-native";
import { theme } from "@/theme";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 28,
      gap: 6,
    },
    
    dot: {
      // Base dot style - size will be set dynamically
    },
    
    proteinDot: {
      backgroundColor: colors.semantic.protein,
    },
    
    carbsDot: {
      backgroundColor: colors.semantic.carbs,
    },
    
    fatDot: {
      backgroundColor: colors.semantic.fat,
    },
  });