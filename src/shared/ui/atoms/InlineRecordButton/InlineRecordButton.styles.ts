import { StyleSheet } from 'react-native';
import { Colors } from '../../../../theme';

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    recording: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
  });