import { StyleSheet } from 'react-native';
import type { Colors, Theme } from '@/theme';

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    floatingActionContainer: {
      position: 'absolute',
      left: '5%',
      right: '5%',
      bottom: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20,
    },
    floatingAccessory: {
      marginHorizontal: theme.spacing.sm,
      backgroundColor: colors.secondaryBackground,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.sm,
      borderRadius: 9999,
      padding: theme.spacing.sm,
      overflow: 'hidden',
    },
    flex1MinWidth0: {
      flex: 1,
      minWidth: 0,
    },
  });

