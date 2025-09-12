import { StyleSheet } from 'react-native';
import type { Colors, Theme } from '@/theme';

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      borderRadius: 9999,
      overflow: 'hidden',
      backgroundColor: colors.accent,
      minHeight: 44,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    disabled: {
      backgroundColor: colors.disabledBackground,
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    label: {
      ...theme.typography.Button,
      color: colors.black,
    },
    // Overlays
    absoluteFill: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    spinnerRing: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0.15)',
      borderTopColor: colors.black,
    },
    successFill: {
      backgroundColor: colors.success,
      borderRadius: 9999,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
  });

