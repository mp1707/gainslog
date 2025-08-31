import { StyleSheet } from "react-native";
import { theme, ColorScheme } from "../../../theme";

type Colors = ReturnType<typeof theme.getColors>;
type ComponentStyles = ReturnType<typeof theme.getComponentStyles>;

export const createStyles = (colors: Colors, colorScheme: ColorScheme) => {
  const { typography, spacing } = theme;
  const componentStyles = theme.getComponentStyles(colorScheme);

  return StyleSheet.create({
  // Base button styles
  base: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 44, // Standard minimum touch target
  },

  // Variant styles - Primary
  primary: {
    backgroundColor: componentStyles.buttons.primary.default.backgroundColor,
    borderRadius: componentStyles.buttons.cornerRadius,
  },

  primaryPressed: {
    backgroundColor: componentStyles.buttons.primary.active.backgroundColor,
  },

  // Variant styles - Secondary
  secondary: {
    backgroundColor: componentStyles.buttons.secondary.default.backgroundColor,
    borderWidth: componentStyles.buttons.secondary.default.borderWidth,
    borderColor: componentStyles.buttons.secondary.default.borderColor,
    borderRadius: componentStyles.buttons.cornerRadius,
  },

  secondaryPressed: {
    backgroundColor: componentStyles.buttons.secondary.active.backgroundColor,
  },

  // Variant styles - Tertiary (outline style)
  tertiary: {
    backgroundColor: componentStyles.buttons.tertiary.default.backgroundColor,
    borderWidth: componentStyles.buttons.tertiary.default.borderWidth,
    borderColor: componentStyles.buttons.tertiary.default.borderColor,
    borderRadius: componentStyles.buttons.cornerRadius,
  },

  tertiaryPressed: {
    backgroundColor: componentStyles.buttons.tertiary.active.backgroundColor,
  },

  // Variant styles - Destructive
  destructive: {
    backgroundColor: componentStyles.buttons.destructive.default.backgroundColor,
    borderRadius: componentStyles.buttons.cornerRadius,
  },

  destructivePressed: {
    backgroundColor: componentStyles.buttons.destructive.active.backgroundColor,
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
    borderRadius: componentStyles.buttons.cornerRadius,
  },

  squareMedium: {
    width: "100%",
    paddingHorizontal: spacing.md,
    borderRadius: componentStyles.buttons.cornerRadius,
  },

  squareLarge: {
    width: "100%",
    paddingHorizontal: spacing.md,
    borderRadius: componentStyles.buttons.cornerRadius,
  },

  // Disabled state
  disabled: {
    backgroundColor: componentStyles.buttons.primary.disabled.backgroundColor,
  },

  // Text styles - Base
  text: {
    color: componentStyles.buttons.primary.default.textColor,
    textAlign: "center",
    fontFamily: typography.Button.fontFamily,
    fontSize: typography.Button.fontSize,
    fontWeight: typography.Button.fontWeight,
  },

  // Text styles for secondary variant
  secondaryText: {
    color: componentStyles.buttons.secondary.default.textColor,
  },

  // Text styles for tertiary variant
  tertiaryText: {
    color: componentStyles.buttons.tertiary.default.textColor,
  },

  // Text styles for disabled state
  disabledText: {
    color: componentStyles.buttons.primary.disabled.textColor,
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
};
