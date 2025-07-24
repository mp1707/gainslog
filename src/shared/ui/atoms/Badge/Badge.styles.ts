import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.component.input.padding,
    paddingVertical: spacing.scale[1],
    borderRadius: spacing.radii.badge,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 28, // Ensure proper touch target
  },

  text: {
    ...typography.textStyles.caption,
    fontFamily: typography.fontFamilies.system,
  },

  // Confidence levels with updated design system colors
  high: {
    backgroundColor: colors.confidence.high.background,
  },

  good: {
    backgroundColor: colors.confidence.good.background,
  },

  partial: {
    backgroundColor: colors.confidence.partial.background,
  },

  uncertain: {
    backgroundColor: colors.confidence.uncertain.background,
  },

  loading: {
    backgroundColor: colors.confidence.loading.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text colors with updated design system
  highText: {
    color: colors.confidence.high.foreground,
  },

  goodText: {
    color: colors.confidence.good.foreground,
  },

  partialText: {
    color: colors.confidence.partial.foreground,
  },

  uncertainText: {
    color: colors.confidence.uncertain.foreground,
  },

  loadingText: {
    color: colors.confidence.loading.foreground,
  },
});