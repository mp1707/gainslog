import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },

  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },

  macroItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 0, // Prevents overflow
    gap: 2,
  },

  label: {
    textAlign: 'center',
    // Additional styling handled by AppText component
  },

  value: {
    textAlign: 'center',
    fontWeight: '600', // Slightly bolder for better readability
    // Additional styling handled by AppText component  
  },
});

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());