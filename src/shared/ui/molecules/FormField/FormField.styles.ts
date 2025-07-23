import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.margin.input,
  },

  label: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.margin.small,
  },

  error: {
    fontSize: typography.sizes.sm,
    color: colors.status.error,
    marginTop: spacing.margin.small,
  },
});