import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },

  label: {
    fontSize: theme.typography.Headline.fontSize,
    fontWeight: theme.typography.Headline.fontWeight,
    fontFamily: theme.typography.Headline.fontFamily,
    color: colors.primaryText,
    marginBottom: theme.spacing.sm,
  },

  error: {
    fontSize: theme.typography.Caption.fontSize,
    fontWeight: theme.typography.Caption.fontWeight,
    fontFamily: theme.typography.Caption.fontFamily,
    color: '#ef4444', // Standard error color
    marginTop: theme.spacing.sm,
  },
});

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());