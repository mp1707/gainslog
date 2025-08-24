// /NutrientStat.styles.ts (Updated)

import { StyleSheet } from 'react-native';
import { theme } from '@/theme';
import type { Colors } from '@/theme/theme';

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center', // Vertically align label and value container
      marginBottom: theme.spacing.sm,
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0, // Keep this to prevent the label from shrinking
      marginRight: theme.spacing.sm, // Increased gap slightly for breathing room
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: theme.spacing.sm,
    },
    labelText: {
      // No change needed
    },
    // This is the new style for our View container
    valueContainer: {
      flex: 1, // Take up all remaining space
      flexDirection: 'row', // Align the numbers side-by-side
      justifyContent: 'flex-start', // Push them to the far right
      alignItems: 'baseline', // A pro-tip for perfect typographic alignment
    },
    currentValue: {
      fontWeight: '600',
    },
    goalValue: {
      // No change needed
    },
  });