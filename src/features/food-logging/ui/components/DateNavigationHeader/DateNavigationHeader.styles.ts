import { StyleSheet } from 'react-native';
import type { Colors, Theme } from '../../../../../theme';

export const createStyles = (colors: Colors, theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    minHeight: 40,
  },

  navigationButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    backgroundColor: colors.secondaryBackground,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },

  navigationButtonDisabled: {
    backgroundColor: colors.disabledBackground,
    borderColor: colors.border,
    opacity: 0.5,
  },

  datePickerContainer: {
    flexShrink: 0,
    marginLeft: -10,
  },
});