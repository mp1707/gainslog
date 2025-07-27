import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  base: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 28, // Ensure proper touch target
  },

  text: {
    // Text styling is handled by AppText component
  },

  // Confidence levels using simplified color scheme
  high: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Green background
  },

  good: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)', // Amber background  
  },

  partial: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red background
  },

  uncertain: {
    backgroundColor: colors.disabledBackground,
  },

  loading: {
    backgroundColor: colors.disabledBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text colors
  highText: {
    color: '#10b981', // Green text
  },

  goodText: {
    color: '#f59e0b', // Amber text
  },

  partialText: {
    color: '#ef4444', // Red text
  },

  uncertainText: {
    color: colors.secondaryText,
  },

  loadingText: {
    color: colors.secondaryText,
  },
});

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());