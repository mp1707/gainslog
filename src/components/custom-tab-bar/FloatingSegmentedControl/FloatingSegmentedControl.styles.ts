import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: colors.secondaryBackground,
      borderRadius: theme.spacing.lg,
      padding: theme.spacing.xs / 2, // 2px padding inside
      shadowColor: colors.primaryText,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    segment: {
      flex: 1,
      paddingVertical: theme.spacing.sm + theme.spacing.xs / 2, // 12px vertical padding
      paddingHorizontal: theme.spacing.md,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.spacing.md + theme.spacing.xs, // 20px border radius
      zIndex: 2,
    },
    segmentText: {
      ...theme.typography.Button,
      fontSize: 16,
      fontWeight: "600",
    },
    activeSegmentText: {
      color: colors.primaryText,
    },
    inactiveSegmentText: {
      color: colors.secondaryText,
    },
    selectionIndicator: {
      position: "absolute",
      top: theme.spacing.xs / 2,
      bottom: theme.spacing.xs / 2,
      borderRadius: theme.spacing.md + theme.spacing.xs, // 20px border radius
      backgroundColor: colors.primaryBackground,
      shadowColor: colors.primaryText,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
      zIndex: 1,
    },
  });
