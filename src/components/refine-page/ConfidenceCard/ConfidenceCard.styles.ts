import { StyleSheet } from 'react-native';
import type { Colors, Theme } from '@/theme';

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      borderRadius: theme.components.cards.cornerRadius,
      backgroundColor: colors.secondaryBackground,
    },
    confidenceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    meterTrack: {
      width: '100%',
      height: 12,
      borderRadius: 6,
      overflow: 'hidden',
      backgroundColor: colors.disabledBackground,
    },
    meterFill: {
      height: '100%',
      borderRadius: 6,
    },
  });

