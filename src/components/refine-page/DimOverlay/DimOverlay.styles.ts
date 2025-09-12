import { StyleSheet } from 'react-native';

export const createStyles = () =>
  StyleSheet.create({
    dimOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    dimColor: {
      backgroundColor: '#000',
      flex: 1,
    },
  });

