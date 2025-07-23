import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  values: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  track: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  percentage: {
    fontSize: 12,
    color: colors.text.secondary,
    alignSelf: 'flex-end',
  },
});