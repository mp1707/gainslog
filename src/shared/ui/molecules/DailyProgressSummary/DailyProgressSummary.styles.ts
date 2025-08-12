import { StyleSheet } from "react-native";
import { theme } from "@/theme";

const colors = theme.getColors();
const { typography, spacing } = theme;

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.secondaryBackground,
    padding: spacing.md,
    marginHorizontal: spacing.pageMargins.horizontal,
    marginBottom: spacing.md,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  macroItem: {
    flex: 1,
    marginRight: spacing.md,
  },
  macroLabel: {
    fontSize: typography.Caption.fontSize,
    fontWeight: typography.Headline.fontWeight,
    fontFamily: typography.Caption.fontFamily,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    minWidth: 2,
  },
  macroValue: {
    fontSize: typography.Subhead.fontSize,
    fontWeight: typography.Headline.fontWeight,
    fontFamily: typography.Subhead.fontFamily,
    color: colors.primaryText,
  },
  caloriesItem: {
    alignItems: "flex-end",
  },
  caloriesLabel: {
    fontSize: typography.Caption.fontSize,
    fontWeight: typography.Headline.fontWeight,
    fontFamily: typography.Caption.fontFamily,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  caloriesValue: {
    fontSize: typography.Body.fontSize,
    fontWeight: typography.Title2.fontWeight,
    fontFamily: typography.Body.fontFamily,
    color: colors.primaryText,
  },
});
