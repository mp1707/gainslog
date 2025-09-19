import { StyleSheet } from "react-native";
import { theme } from "@/theme";
import type { Colors } from "@/theme";

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    cardContainer: {
      position: "relative",
    },
    card: {},
    pressable: {
      flex: 1,
    },
    contentContainer: {
      flexDirection: "row",
      flex: 1,
      gap: theme.spacing.md,
      alignItems: "stretch",
    },
    leftSection: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "space-between",
      maxWidth: "70%",
    },
    rightSection: {
      justifyContent: "center",
      alignItems: "flex-start",
      minWidth: "35%",
    },
    confidenceInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    title: {},
    description: {
      fontStyle: "italic",
      marginTop: theme.spacing.xs,
    },
    pressOverlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      borderRadius: theme.components.cards.cornerRadius,
    },
    flashOverlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      borderRadius: theme.components.cards.cornerRadius,
    },

    // Skeleton styles
    skeletonTitleContainer: {
      gap: theme.spacing.xs,
    },
    skeletonTitleLine: {
      height: theme.typography.Headline.fontSize + 2,
      backgroundColor: colors.border,
      borderRadius: theme.spacing.md,
      width: "100%",
    },
    skeletonTitleLineShort: {
      height: theme.typography.Headline.fontSize + 2,
      backgroundColor: colors.border,
      borderRadius: theme.spacing.md,
      width: "75%",
    },
    skeletonDescription: {
      height: theme.typography.Body.fontSize,
      backgroundColor: colors.border,
      borderRadius: theme.spacing.md,

      width: "90%",
      marginTop: theme.spacing.xs,
    },
    skeletonConfidenceBadge: {
      height: 28,
      width: 80,
      backgroundColor: colors.border,
      borderRadius: theme.spacing.sm,
    },
    skeletonNutritionContainer: {
      gap: theme.spacing.sm,
      alignItems: "flex-end",
      width: "100%",
    },
    skeletonNutritionValue: {
      height: theme.typography.Headline.fontSize + 4,
      width: "100%",
      backgroundColor: colors.border,
      borderRadius: theme.spacing.md,
    },
  });
