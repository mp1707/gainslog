import { StyleSheet } from 'react-native';
import type { Colors } from '@/theme';

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.25)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.secondaryBackground,
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
      paddingBottom: 8,
    },
    item: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.subtleBorder,
    },
    itemText: {
      color: colors.primaryText,
    },
    destructiveText: {
      color: '#FF3B30',
    },
    cancelBlock: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: 14,
      margin: 8,
      marginTop: 10,
      marginBottom: 20,
    },
    cancelItem: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelText: {
      color: colors.accent,
    },
  });

