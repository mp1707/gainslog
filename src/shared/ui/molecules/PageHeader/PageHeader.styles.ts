import { StyleSheet } from "react-native";
import { colors, spacing } from "../../../../theme";

export const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.primary,
  },

  content: {
    flexDirection: "column",
    gap: spacing.md,
  },
});