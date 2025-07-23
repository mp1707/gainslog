import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
  },
  progressCircle: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
    marginTop: 2,
  },
  valuesText: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 1,
  },
});