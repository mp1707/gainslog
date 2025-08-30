import { StyleSheet } from "react-native";
import { theme } from "../../../theme";

const colors = theme.getColors();
const { typography, spacing, components } = theme;

export const styles = StyleSheet.create({
  // Base button styles
  base: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 44, // Standard minimum touch target
  },

  // Variant styles - Primary
  primary: {
    backgroundColor: components.buttons.primary.default.backgroundColor,
    borderRadius: components.buttons.cornerRadius,
  },

  primaryPressed: {
    backgroundColor: components.buttons.primary.active.backgroundColor,
  },

  // Variant styles - Secondary
  secondary: {
    backgroundColor: components.buttons.secondary.default.backgroundColor,
    borderWidth: components.buttons.secondary.default.borderWidth,
    borderColor: components.buttons.secondary.default.borderColor,
    borderRadius: components.buttons.cornerRadius,
  },

  secondaryPressed: {
    backgroundColor: components.buttons.secondary.active.backgroundColor,
  },

  // Variant styles - Tertiary (outline style)
  tertiary: {
    backgroundColor: colors.secondaryBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: components.buttons.cornerRadius,
  },

  tertiaryPressed: {
    backgroundColor: colors.primaryBackground,
  },

  // Variant styles - Destructive (using accent as destructive for now)
  destructive: {
    backgroundColor: colors.accent,
    borderRadius: components.buttons.cornerRadius,
  },

  destructivePressed: {
    backgroundColor: colors.accent, // Could be darker variant
  },

  // Shape styles - Round (circular buttons)
  roundSmall: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: spacing.md,
  },

  roundMedium: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: spacing.lg,
  },

  roundLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  // Shape styles - Square (full-width buttons)
  squareSmall: {
    width: "100%",
    height: spacing.xl,
    paddingHorizontal: spacing.md,
    borderRadius: components.buttons.cornerRadius,
  },

  squareMedium: {
    width: "100%",
    height: spacing.xxl,
    paddingHorizontal: spacing.md,
    borderRadius: components.buttons.cornerRadius,
  },

  squareLarge: {
    width: "100%",
    height: 56,
    paddingHorizontal: spacing.md,
    borderRadius: components.buttons.cornerRadius,
  },

  // Disabled state
  disabled: {
    backgroundColor: components.buttons.primary.disabled.backgroundColor,
  },

  // Text styles - Base
  text: {
    color: components.buttons.primary.default.textColor,
    textAlign: "center",
    fontFamily: typography.Button.fontFamily,
    fontSize: typography.Button.fontSize,
    fontWeight: typography.Button.fontWeight,
  },

  // Text styles for secondary variant
  secondaryText: {
    color: components.buttons.secondary.default.textColor,
  },

  // Text styles for tertiary variant
  tertiaryText: {
    color: colors.primaryText,
  },

  // Text styles for disabled state
  disabledText: {
    color: components.buttons.primary.disabled.textColor,
  },

  // Round text styles (for icon-only buttons)
  roundSmallText: {
    fontFamily: typography.Caption.fontFamily,
    fontSize: typography.Caption.fontSize,
    fontWeight: typography.Caption.fontWeight,
  },

  roundMediumText: {
    fontFamily: typography.Subhead.fontFamily,
    fontSize: typography.Subhead.fontSize,
    fontWeight: typography.Subhead.fontWeight,
  },

  roundLargeText: {
    fontFamily: typography.Body.fontFamily,
    fontSize: typography.Body.fontSize,
    fontWeight: typography.Body.fontWeight,
  },

  // Square text styles (for text buttons)
  squareSmallText: {
    fontFamily: typography.Button.fontFamily,
    fontSize: typography.Caption.fontSize,
    fontWeight: typography.Button.fontWeight,
  },

  squareMediumText: {
    fontFamily: typography.Button.fontFamily,
    fontSize: typography.Button.fontSize,
    fontWeight: typography.Button.fontWeight,
  },

  squareLargeText: {
    fontFamily: typography.Button.fontFamily,
    fontSize: typography.Headline.fontSize,
    fontWeight: typography.Button.fontWeight,
  },

  // Icon layout styles
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  iconLeft: {
    marginRight: spacing.xs,
  },

  iconRight: {
    marginLeft: spacing.xs,
  },

  iconOnly: {
    margin: 0,
  },
});
