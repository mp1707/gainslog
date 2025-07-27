import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

const colors = theme.getColors();
const { typography, spacing } = theme;

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
    fontSize: typography.Headline.fontSize,
    fontWeight: typography.Title2.fontWeight,
    fontFamily: typography.Headline.fontFamily,
    color: colors.primaryText,
  },
  labelText: {
    fontSize: typography.Caption.fontSize,
    fontWeight: typography.Subhead.fontWeight,
    fontFamily: typography.Caption.fontFamily,
    color: colors.secondaryText,
    marginTop: 2,
  },
  valuesText: {
    fontSize: 10,
    fontFamily: typography.Caption.fontFamily,
    color: colors.secondaryText,
    marginTop: 1,
  },
});