import { StyleSheet } from 'react-native';
import type { Colors } from '../../../../theme';

export const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryBackground,
    borderRadius: 12,
    padding: 12,
  },

  containerSmall: {
    padding: 8,
    borderRadius: 8,
  },

  containerMedium: {
    padding: 12,
    borderRadius: 12,
  },

  containerLarge: {
    padding: 16,
    borderRadius: 16,
  },

  playButton: {
    backgroundColor: colors.accent,
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowColor: colors.accent,
    elevation: 4,
  },

  playButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },

  playButtonMedium: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },

  playButtonLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },

  progressContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 8,
    position: 'relative',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },

  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: colors.accent,
    borderRadius: 8,
    marginLeft: -8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    elevation: 3,
  },

  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  timeText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    fontWeight: '400',
    color: colors.secondaryText,
    letterSpacing: 0,
  },
});