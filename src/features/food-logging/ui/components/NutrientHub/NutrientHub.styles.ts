import { StyleSheet } from "react-native";
import type { Colors } from "@/theme";

// Simplified styles for the new NutrientHub container
// Individual components (LargeNutrientHub, CompactNutrientHub) handle their own styling
export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    // Container for the transition between large and compact views
    container: {
      position: "relative",
      width: "100%",
    },
  });
