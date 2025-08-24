import { useThemedStyles } from '@/theme/ThemeProvider';
import { StyleSheet } from 'react-native';

export const useStyles = () => useThemedStyles((colors, theme) => StyleSheet.create({
  // Modal container - for page sheet presentation
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },

  // Modal content
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },

  // Error display (still used in main modal)
  errorContainer: {
    backgroundColor: colors.errorBackground,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.spacing.xs,
  },

  errorText: {
    fontSize: theme.typography.Body.fontSize,
    fontFamily: theme.typography.Body.fontFamily,
    color: colors.error,
    lineHeight: theme.typography.Body.fontSize * 1.4,
  },
}));