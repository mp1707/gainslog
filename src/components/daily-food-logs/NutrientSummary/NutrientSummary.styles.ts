import { StyleSheet } from 'react-native';
import { theme } from '@/theme';
import type { Colors } from '@/theme/theme';

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.md,
    },
    title: {
      color: colors.primaryText,
      marginBottom: theme.spacing.sm,
    },
    dateSwitcher: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: colors.disabledBackground,
      borderRadius: 12,
      marginBottom: theme.spacing.md,
    },
    dateButton: {
      padding: theme.spacing.sm,
      borderRadius: 8,
      backgroundColor: 'transparent',
    },
    dateText: {
      color: colors.primaryText,
      fontWeight: '600',
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
    },
    ringsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsContainer: {
      flex: 1,
      flexDirection: 'column',
      gap: theme.spacing.sm,
    },
    // Override the NutrientStat width for vertical layout
    statItem: {
      width: '100%',
      marginBottom: 0,
    },
  });