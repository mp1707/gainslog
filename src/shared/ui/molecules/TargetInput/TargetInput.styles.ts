import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 200,
  },
  input: {
    flex: 1,
    minWidth: 80,
  },
  unit: {
    fontSize: 16,
    color: colors.text.secondary,
    marginLeft: 12,
    fontWeight: '500',
  },
});