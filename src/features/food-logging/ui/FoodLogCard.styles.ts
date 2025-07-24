import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.radius['2xl'],
    padding: spacing.padding.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.light,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.margin.large,
  },

  titleContent: {
    flex: 1,
    marginRight: spacing.margin.large,
  },

  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.normal,
    marginBottom: spacing.xs,
  },

  loadingTitle: {
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },

  description: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.tight,
    fontStyle: 'italic',
  },

  rightSection: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },

});