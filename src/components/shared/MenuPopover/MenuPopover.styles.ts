import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const MENU_WIDTH = 200;
export const SPACING = 8;

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    animatedWrapper: {
      position: "absolute",
      zIndex: 20,
    },
    menuContainer: {
      borderRadius: theme.components.cards.cornerRadius,
      overflow: "hidden",
      width: MENU_WIDTH,
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 12 },
      elevation: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    backdrop: {
      backgroundColor: colors.secondaryBackground,
      opacity: 0.5,
    },
    content: {},
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      paddingHorizontal: 16,
      gap: 14,
    },
    firstItem: {
      paddingTop: theme.spacing.md + 4,
    },
    lastItem: {
      paddingBottom: theme.spacing.md + 4,
    },
    separator: {
      height: 0.5,
      backgroundColor: colors.border,
      marginHorizontal: 12,
    },
    measureContainer: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0,
    },
  });
