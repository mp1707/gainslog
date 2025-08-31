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

  // Size styles
  small: {
    minHeight: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: componentStyles.buttons.cornerRadius,
  },

  medium: {
    width: "100%",
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: componentStyles.buttons.cornerRadius,
  },

  large: {
    width: "100%",
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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
    flexShrink: 1,
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

  // Size-specific text styles
  smallText: {
    fontFamily: typography.Button.fontFamily,
    fontSize: typography.Body.fontSize,
    fontWeight: typography.Button.fontWeight,
  },

  mediumText: {
    fontFamily: typography.Button.fontFamily,
    fontSize: typography.Button.fontSize,
    fontWeight: typography.Button.fontWeight,
  },

  largeText: {
    fontFamily: typography.Button.fontFamily,
    fontSize: typography.Headline.fontSize,
    fontWeight: typography.Button.fontWeight,
  },

  // Icon layout styles
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap",
    minHeight: 44,
  },

  iconLeft: {
    marginRight: spacing.sm,
  },

  iconRight: {
    marginLeft: spacing.sm,
  },

  iconOnly: {
    margin: 0,
  },
  });
};
