import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    cardContainer: {
      position: "relative",
    },
    sectionHeader: {
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.6,
      color: colors.secondaryText,
    },
    macroRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.sm,
      position: "relative",
    },
    macroLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      flexShrink: 1,
    },
    macroValueContainer: {
      minWidth: 120,
      marginLeft: theme.spacing.lg,
      alignItems: "flex-end",
      justifyContent: "center",
      height: theme.spacing.lg + theme.spacing.xs,
      overflow: "hidden",
      flexShrink: 0,
      flexGrow: 1,
    },
    staticValueText: {
      textAlign: "right",
    },
    macroDot: {
      width: theme.spacing.sm,
      height: theme.spacing.sm,
      borderRadius: theme.spacing.xs,
      marginRight: theme.spacing.xs,
    },
    macroLoaderPlaceholder: {
      width: "100%",
      height: theme.spacing.md,
      borderRadius: theme.spacing.md,
      backgroundColor: colors.subtleBackground,
      opacity: 0.65,
    },
    macroLoaderLayer: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      justifyContent: "center",
      overflow: "hidden",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    blurOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: theme.components.cards.cornerRadius,
      overflow: "hidden",
    },
    blurView: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    recalculateButtonContainer: {
      paddingHorizontal: theme.spacing.md,
      width: "100%",
    },
    animatedNumberText: {
      fontSize: theme.typography.Body.fontSize,
      fontFamily: theme.typography.Body.fontFamily,
      color: colors.secondaryText,
      textAlign: "right",
      padding: 0,
      margin: 0,
      borderWidth: 0,
      backgroundColor: "transparent",
    },
  });
