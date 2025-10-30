import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      // Section container (no card wrapper)
    },
    sectionHeader: {
      letterSpacing: 0.6,
      color: colors.secondaryText,
    },
    sectionFooter: {
      marginTop: theme.spacing.sm,
      letterSpacing: 0.4,
      color: colors.secondaryText,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    staleChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      height: 24,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: 12,
      backgroundColor:
        colors.semanticBadges?.calories?.background || colors.subtleBackground,
    },
    staleChipText: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.semanticBadges?.calories?.text || colors.secondaryText,
    },
    listContainer: {
      backgroundColor: colors.primaryBackground,
      borderRadius: theme.components.cards.cornerRadius,
      overflow: "hidden",
    },
    macroRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.sm,
      position: "relative",
      minHeight: 56, // 7 × 8pt for native feel
      overflow: "hidden", // Critical for clean clipping during animation
    },
    macroLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
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
      width: 10, // 10pt colored dot as per design feedback
      height: 10,
      borderRadius: 5,
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
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.subtleBorder,
      // Full-bleed within content column - identical to ComponentsList
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
