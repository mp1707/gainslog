import { useThemedStyles } from "@/providers/ThemeProvider";
import { StyleSheet } from "react-native";

export const useStyles = () =>
  useThemedStyles((colors, theme) =>
    StyleSheet.create({
      cardContainer: {},
      row: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
      },
      dateColumn: {
        width: 88,
        justifyContent: "center",
        alignItems: "flex-start",
        paddingVertical: theme.spacing.sm,
      },
      metricsColumn: {
        flex: 1,
      },
      rowGap: {
        height: theme.spacing.sm,
      },
      pressOverlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: theme.components.cards.cornerRadius,
      },
    })
  );
