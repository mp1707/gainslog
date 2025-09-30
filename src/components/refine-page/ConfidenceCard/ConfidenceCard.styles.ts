import { StyleSheet } from "react-native";

import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    card: {
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.components.cards.cornerRadius,
      backgroundColor: colors.secondaryBackground,
    },
    sectionLabel: {
      color: colors.secondaryText,
      letterSpacing: 0.6,
      marginBottom: theme.spacing.md,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    titleText: {
      color: colors.primaryText,
      flexShrink: 1,
    },
    barsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    barsContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
    },
    barTrack: {
      flex: 1,
      height: 6,
      borderRadius: 999,
      backgroundColor: colors.subtleBackground,
      overflow: "hidden",
      position: "relative",
    },
    barTrackSpacing: {
      marginRight: theme.spacing.sm,
    },
    barGlow: {
      position: "absolute",
      left: -6,
      right: -6,
      top: -6,
      bottom: -6,
      borderRadius: 999,
      backgroundColor: colors.accent,
      opacity: 0,
    },
    barFill: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      borderRadius: 999,
      backgroundColor: colors.accent,
      opacity: 0,
    },
    barShimmer: {
      position: "absolute",
      top: -10,
      bottom: -10,
      left: -20,
    },
    infoContainer: {
      marginTop: theme.spacing.sm,
    },
    infoPill: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
    },
    infoIconSpacing: {
      marginRight: theme.spacing.xs,
    },
    infoText: {
      color: colors.secondaryText,
      flexShrink: 1,
    },
  });
