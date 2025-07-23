import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.radius['2xl'],
    padding: spacing.padding.card,
    marginBottom: spacing.margin.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.light,
    opacity: 0.6,
  },

  title: {
    marginBottom: spacing.margin.large,
  },

  macros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.padding.small,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.light,
  },
});