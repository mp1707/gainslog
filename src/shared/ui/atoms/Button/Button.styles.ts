import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

export const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: spacing.radius.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Variants
  primary: {
    backgroundColor: colors.brand.primary,
    shadowColor: colors.brand.primary,
  },

  secondary: {
    backgroundColor: colors.brand.secondary,
    shadowColor: colors.brand.secondary,
  },

  danger: {
    backgroundColor: colors.brand.danger,
    shadowColor: colors.brand.danger,
  },

  // Sizes
  small: {
    width: spacing.button.small.width,
    height: spacing.button.small.height,
    borderRadius: spacing.button.small.radius,
  },

  medium: {
    width: spacing.button.medium.width,
    height: spacing.button.medium.height,
    borderRadius: spacing.button.medium.radius,
  },

  large: {
    width: spacing.button.large.width,
    height: spacing.button.large.height,
    borderRadius: spacing.button.large.radius,
  },

  // States
  disabled: {
    backgroundColor: colors.text.tertiary,
    shadowColor: colors.text.tertiary,
  },

  // Text styles
  text: {
    color: colors.text.white,
    textAlign: 'center',
  },

  primaryText: {
    color: colors.text.white,
  },

  secondaryText: {
    color: colors.text.white,
  },

  dangerText: {
    color: colors.text.white,
  },

  smallText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.normal,
    lineHeight: spacing.button.small.height,
  },

  mediumText: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.light,
    lineHeight: spacing.button.medium.height,
  },

  largeText: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.normal,
    lineHeight: spacing.button.large.height,
  },
});