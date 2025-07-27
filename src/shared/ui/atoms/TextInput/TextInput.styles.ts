import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  // Base input styles
  base: {
    backgroundColor: colors.secondaryBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.Body.fontSize,
    fontWeight: theme.typography.Body.fontWeight,
    color: colors.primaryText,
    fontFamily: theme.typography.Body.fontFamily,
    minHeight: 44, // Minimum touch target
  },

  // Focus state
  focused: {
    borderColor: colors.accent,
    borderWidth: 2,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Error state
  error: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
  },

  // Disabled state
  disabled: {
    backgroundColor: colors.disabledBackground,
    color: colors.disabledText,
    borderColor: colors.border,
    opacity: 0.6,
  },

  // Multiline variant
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
  },
});

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());