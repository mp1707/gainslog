import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 8, // component.image from design system
  },
  skeleton: {
    flex: 1,
    backgroundColor: '#e5e7eb', // skeleton.base from design system
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f3f4f6', // skeleton.highlight from design system
    opacity: 0.8,
    width: '50%',
  },
});