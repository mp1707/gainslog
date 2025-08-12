import { StyleSheet } from "react-native";
import { theme, type Colors } from "@/theme";

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      backgroundColor: colors.secondaryBackground,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    content: {
      flexDirection: "column",
      gap: theme.spacing.md,
      position: "relative",
    },
  });

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());
