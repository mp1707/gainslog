import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

export const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Shape styles
  round: {
    // Specific dimensions handled by size combinations
  },

  square: {
    width: '100%',
    borderRadius: spacing.radius.lg,
  },

  // Color styles
  primary: {
    backgroundColor: colors.brand.primary,
    shadowColor: colors.brand.primary,
  },

  secondary: {
    backgroundColor: colors.brand.secondary,
    shadowColor: colors.brand.secondary,
  },

  tertiary: {
    backgroundColor: colors.brand.danger,
    shadowColor: colors.brand.danger,
  },

  // Round size combinations
  roundSmall: {
    width: spacing.button.small.width,
    height: spacing.button.small.height,
    borderRadius: spacing.button.small.radius,
  },

  roundMedium: {
    width: spacing.button.medium.width,
    height: spacing.button.medium.height,
    borderRadius: spacing.button.medium.radius,
  },

  roundLarge: {
    width: spacing.button.large.width,
    height: spacing.button.large.height,
    borderRadius: spacing.button.large.radius,
  },

  // Square size combinations
  squareSmall: {
    height: 40,
  },

  squareMedium: {
    height: 48,
  },

  squareLarge: {
    height: 56,
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

  // Round text styles
  roundSmallText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.normal,
    lineHeight: spacing.button.small.height,
  },

  roundMediumText: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.light,
    lineHeight: spacing.button.medium.height,
  },

  roundLargeText: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.normal,
    lineHeight: spacing.button.large.height,
  },

  // Square text styles
  squareSmallText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },

  squareMediumText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },

  squareLargeText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
  },
});