import { StyleSheet } from 'react-native';
import { theme } from '@/theme';

const DOT_SIZE = theme.spacing.sm;

export const createStyles = () =>
  StyleSheet.create({
    container: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
      marginRight: theme.spacing.sm,
    },
    dot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      marginRight: theme.spacing.sm,
    },
    labelText: {},
    valueContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'baseline',
    },
    currentValue: {
      fontWeight: '600',
    },
    goalValue: {},
  });
