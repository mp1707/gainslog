import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

export const createStyles = (colors: any) => StyleSheet.create({
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
  },
});

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());