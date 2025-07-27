import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },

  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },

  label: {
    // Styling handled by AppText component
  },

  value: {
    // Styling handled by AppText component  
  },
});

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());