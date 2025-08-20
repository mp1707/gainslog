import { StyleSheet, Dimensions, Platform } from "react-native";
import { theme } from "@/theme";
import type { Colors } from "@/theme";

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    animatedContainer: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },

    // --------------------------------------------------
    // NEW STYLES FOR HORIZONTAL NUTRIENT VALUES
    // --------------------------------------------------
    nutrientValuesWrapper: {
      width: "80%",
      flexDirection: "row",
      flexWrap: "wrap",
      // justifyContent: "space-between",
      alignItems: "center", // Align values to the bottom

      marginTop: theme.spacing.xl, // Generous spacing below the rings
    },

    // This wrapper is for compact mode, when the container becomes horizontal
    compactValuesWrapper: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
      marginTop: 0,
      gap: theme.spacing.xs,
    },

    nutrientValueContainer: {
      alignItems: "center",
      marginHorizontal: theme.spacing.sm,
      // Layout change for compact mode
      ...Platform.select({
        ios: {
          flexDirection: "row",
          gap: theme.spacing.xs,
        },
      }),
    },

    // Color-coded dot
    colorDot: {
      width: theme.spacing.sm, // 8px
      height: theme.spacing.sm, // 8px
      borderRadius: theme.spacing.xs, // 4px
      ...Platform.select({
        ios: {
          marginBottom: 0, // No bottom margin in compact mode
        },
      }),
    },

    // Main value (e.g., '50/200')
    valueText: {
      ...theme.typography.Body, // Use a readable text size
      fontWeight: "700",
      color: colors.primaryText,
      marginTop: theme.spacing.xs,
      // Layout change for compact mode
      ...Platform.select({
        ios: {
          marginTop: 0,
        },
      }),
    },

    // Unit text ('g', 'kcal')
    unitText: {
      ...theme.typography.Caption,
      color: colors.secondaryText,
      textTransform: "uppercase",
      fontWeight: "500",
    },

    // Label text ('Protein', 'Carbs')
    labelText: {
      ...theme.typography.Caption,
      color: colors.secondaryText,
      marginTop: theme.spacing.xs,
      // Layout change for compact mode
      ...Platform.select({
        ios: {
          marginTop: 0,
        },
      }),
    },

    innerCircleContent: {
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      gap: theme.spacing.xs,
      minWidth: 70,
    },

    innerNutrientLabel: {
      color: colors.secondaryText,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: 50,
    },

    innerNutrientValue: {
      textAlign: "center",
    },

    touchableInfoSection: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: -100 }, { translateY: -60 }],
      width: 160,
      height: 120,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      borderRadius: theme.spacing.md,
    },

    arrowIndicator: {
      alignItems: "center",
      justifyContent: "center",
    },
  });
