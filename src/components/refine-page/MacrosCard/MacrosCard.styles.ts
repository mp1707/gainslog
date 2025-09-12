import { StyleSheet } from 'react-native';
import type { Colors, Theme } from '@/theme';

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      borderRadius: theme.components.cards.cornerRadius,
      backgroundColor: colors.secondaryBackground,
    },
    sectionHeader: {
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.5,
      color: colors.secondaryText,
    },
    macroRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
    },
    macroLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      flexShrink: 1,
    },
    macroDot: {
      width: theme.spacing.sm,
      height: theme.spacing.sm,
      borderRadius: theme.spacing.xs,
      marginRight: theme.spacing.xs,
    },
    divider: {
      height: 1,
      marginHorizontal: -theme.spacing.md,
      backgroundColor: colors.border,
    },
  });

