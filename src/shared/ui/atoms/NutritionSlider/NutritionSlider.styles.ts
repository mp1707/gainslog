import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

const colors = theme.getColors();
const { typography, spacing } = theme;

export const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: typography.Body.fontSize,
    fontWeight: typography.Headline.fontWeight,
    fontFamily: typography.Body.fontFamily,
    color: colors.primaryText,
    letterSpacing: -0.4,
  },
  value: {
    fontSize: typography.Body.fontSize,
    fontWeight: typography.Headline.fontWeight,
    fontFamily: typography.Body.fontFamily,
    color: colors.accent,
    letterSpacing: -0.4,
    minWidth: 70,
    textAlign: 'right',
  },
  sliderContainer: {
    paddingHorizontal: 8,
  },
  slider: {
    width: '100%',
    height: 44,
    marginVertical: 8,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rangeLabel: {
    fontSize: typography.Caption.fontSize,
    fontWeight: typography.Caption.fontWeight,
    fontFamily: typography.Caption.fontFamily,
    color: colors.secondaryText,
    letterSpacing: -0.08,
  },
});