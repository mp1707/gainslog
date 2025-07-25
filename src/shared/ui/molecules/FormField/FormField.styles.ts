import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.margin.input,
  },

  label: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.margin.small,
  },

  error: {
    fontSize: typography.fontSizes.sm,
    color: colors.functional.error.foreground,
    marginTop: spacing.margin.small,
  },
});