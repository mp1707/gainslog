import { StyleSheet } from 'react-native';
import type { Colors, Theme } from '@/theme';

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      borderRadius: theme.components.cards.cornerRadius,
      backgroundColor: colors.secondaryBackground,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionHeader: {
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.5,
      color: colors.secondaryText,
    },
    overflowHidden: {
      overflow: 'hidden',
    },
    componentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    deleteAction: {
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.xs,
      borderRadius: theme.components.cards.cornerRadius,
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    addRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    addLabel: {
      marginLeft: 8,
    },
    componentName: {
      flex: 1,
    },
    amountText: {
      marginRight: 8,
    },
  });

