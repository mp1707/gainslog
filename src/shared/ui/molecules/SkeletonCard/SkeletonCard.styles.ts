import { StyleSheet } from 'react-native';
import { useThemedStyles } from '../../../../providers/ThemeProvider';

export const useStyles = () => useThemedStyles((colors, theme) => StyleSheet.create({
  card: {
    borderRadius: theme.components.cards.cornerRadius,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.components.cards.lightMode,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    opacity: 0.6,
  },

  title: {
    marginBottom: theme.spacing.lg,
  },

  macros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
}));