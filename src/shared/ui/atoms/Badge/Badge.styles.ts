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
  low: {
    backgroundColor: colors.confidence.low.background,
  },

  medium: {
    backgroundColor: colors.confidence.medium.background,
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
  lowText: {
    color: colors.confidence.low.text,
  },

  mediumText: {
    color: colors.confidence.medium.text,
  },

  highText: {
    color: colors.confidence.high.text,
  },
});