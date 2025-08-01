import { StyleSheet } from 'react-native';
import { Colors } from '../../../../theme';

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#FF3B30', // iOS red for stop button
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 1000,
    },
  });