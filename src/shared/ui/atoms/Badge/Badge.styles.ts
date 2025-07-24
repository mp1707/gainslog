import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.padding.small,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  text: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },

  // Confidence levels
  uncertain: {
    backgroundColor: colors.confidence.uncertain.background,
  },

  partial: {
    backgroundColor: colors.confidence.partial.background,
  },

  good: {
    backgroundColor: colors.confidence.good.background,
  },

  high: {
    backgroundColor: colors.confidence.high.background,
  },

  loading: {
    backgroundColor: colors.confidence.loading.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text colors
  uncertainText: {
    color: colors.confidence.uncertain.text,
  },

  partialText: {
    color: colors.confidence.partial.text,
  },

  goodText: {
    color: colors.confidence.good.text,
  },

  highText: {
    color: colors.confidence.high.text,
  },
});