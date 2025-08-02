import { StyleSheet } from 'react-native';
import { useThemedStyles } from '@/providers/ThemeProvider';

export const useStyles = () => useThemedStyles((colors, theme) => StyleSheet.create({
  // Modal header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  title: {
    fontSize: theme.typography.Title2.fontSize,
    fontFamily: theme.typography.Title2.fontFamily,
    fontWeight: theme.typography.Title2.fontWeight,
    color: colors.primaryText,
  },

  // Header buttons
  cancelButton: {
    fontSize: theme.typography.Headline.fontSize,
    fontFamily: theme.typography.Headline.fontFamily,
    color: colors.secondaryText,
  },

  saveButton: {
    fontSize: theme.typography.Headline.fontSize,
    fontFamily: theme.typography.Headline.fontFamily,
    color: colors.accent,
  },

  saveButtonDisabled: {
    color: colors.disabledText,
  },
}));