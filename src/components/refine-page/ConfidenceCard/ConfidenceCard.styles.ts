import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      borderRadius: theme.components.cards.cornerRadius,
      backgroundColor: colors.secondaryBackground,
    },
    sectionHeader: {
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.5,
      color: colors.secondaryText,
    },
    confidenceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    batteryInfoLayout: {
      marginBottom: theme.spacing.xs,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: theme.spacing.sm,
    },
    percentageText: {
      width: "45%",
      fontSize: 40,
      fontWeight: "700" as const,
      lineHeight: 52,
      textAlign: "justify",
      marginBottom: -4,
    },
    warningMessage: {
      width: "45%",
      color: colors.secondaryText,
      lineHeight: 16,
      fontSize: 12,
      textAlign: "right",
      alignSelf: "flex-end",
    },
    meterTrack: {
      width: "100%",
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.disabledBackground,
    },
    meterFill: {
      height: "100%",
      borderRadius: 6,
      overflow: "hidden", // ensure inner effects are clipped to fill
    },
    innerPulseOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "rgba(255,255,255,0.25)",
    },
    shimmerOverlay: {
      position: "absolute",
      left: -100,
      top: 0,
      bottom: 0,
      width: 200,
    },
    shimmerGradient: {
      flex: 1,
    },
    bigGlowOverlay: {
      position: "absolute",
      left: -200,
      top: -4,
      bottom: -4,
      width: 300,
    },
    bigGlowGradient: {
      flex: 1,
    },
    rushPulseOverlay: {
      position: "absolute",
      left: -200,
      top: -6,
      bottom: -6,
      width: 400,
    },
    rushPulseGradient: {
      flex: 1,
    },
    increaseOverlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      borderRadius: 6,
    },
  });
