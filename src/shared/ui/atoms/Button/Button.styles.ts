import { StyleSheet } from 'react-native';
import { colors, typography, spacing, shadows, accessibility } from '@/theme';

export const styles = StyleSheet.create({
  // Base button styles
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.presets.button,
    // Accessibility
    minHeight: accessibility.touchTargets.minimum,
  },

  // Variant styles - Primary
  primary: {
    backgroundColor: colors.interactive.primary.default,
    shadowColor: colors.interactive.primary.default,
  },

  primaryPressed: {
    backgroundColor: colors.interactive.primary.pressed,
  },

  // Variant styles - Secondary
  secondary: {
    backgroundColor: colors.interactive.secondary.default,
    shadowColor: colors.interactive.secondary.default,
  },

  secondaryPressed: {
    backgroundColor: colors.interactive.secondary.pressed,
  },

  // Variant styles - Tertiary (outline style)
  tertiary: {
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.elevation[0], // No shadow for tertiary
  },

  tertiaryPressed: {
    backgroundColor: colors.surface.secondary,
  },

  // Variant styles - Destructive
  destructive: {
    backgroundColor: colors.interactive.destructive.default,
    shadowColor: colors.interactive.destructive.default,
  },

  destructivePressed: {
    backgroundColor: colors.interactive.destructive.pressed,
  },

  // Shape styles - Round (circular buttons)
  roundSmall: {
    width: spacing.button.small.width,
    height: spacing.button.small.height,
    borderRadius: spacing.radii.button.small,
  },

  roundMedium: {
    width: spacing.button.medium.width,
    height: spacing.button.medium.height,
    borderRadius: spacing.radii.button.medium,
  },

  roundLarge: {
    width: spacing.button.large.width,
    height: spacing.button.large.height,
    borderRadius: spacing.radii.button.large,
  },

  // Shape styles - Square (full-width buttons)
  squareSmall: {
    width: '100%',
    height: 40,
    paddingHorizontal: spacing.component.button.paddingHorizontal,
    borderRadius: spacing.radii.button.square,
  },

  squareMedium: {
    width: '100%',
    height: 48,
    paddingHorizontal: spacing.component.button.paddingHorizontal,
    borderRadius: spacing.radii.button.square,
  },

  squareLarge: {
    width: '100%',
    height: 56,
    paddingHorizontal: spacing.component.button.paddingHorizontal,
    borderRadius: spacing.radii.button.square,
  },

  // Disabled state
  disabled: {
    backgroundColor: colors.interactive.primary.disabled,
    shadowColor: colors.interactive.primary.disabled,
    ...shadows.elevation[0], // Remove shadow when disabled
  },

  // Text styles - Base
  text: {
    color: colors.text.onColor,
    textAlign: 'center',
    fontFamily: typography.fontFamilies.system,
  },

  // Text styles for tertiary variant
  tertiaryText: {
    color: colors.text.primary,
  },

  // Text styles for disabled state
  disabledText: {
    color: colors.text.quaternary,
  },

  // Round text styles (for icon-only buttons)
  roundSmallText: {
    ...typography.textStyles.footnote,
    lineHeight: spacing.button.small.height,
  },

  roundMediumText: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.light,
    lineHeight: spacing.button.medium.height,
  },

  roundLargeText: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.regular,
    lineHeight: spacing.button.large.height,
  },

  // Square text styles (for text buttons)
  squareSmallText: {
    ...typography.buttonTextStyles.small,
  },

  squareMediumText: {
    ...typography.buttonTextStyles.medium,
  },

  squareLargeText: {
    ...typography.buttonTextStyles.large,
  },
});