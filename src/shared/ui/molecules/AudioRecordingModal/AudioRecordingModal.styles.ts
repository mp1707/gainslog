import { StyleSheet } from 'react-native';
import type { Colors } from '../../../../theme';

export const createStyles = (colors: Colors) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  container: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: 20,
    width: 320,
    maxWidth: '90%',
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },

  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  controlsContainer: {
    alignItems: 'center',
    width: '100%',
  },

  recordingButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },

  stopButton: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  recordingInfo: {
    alignItems: 'center',
  },

  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: 8,
  },

  recordingText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 17,
    fontWeight: '400',
    color: colors.accent,
    letterSpacing: -0.1,
  },

  timerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryText,
    letterSpacing: -0.5,
  },

  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.disabledBackground,
    borderRadius: 24,
    gap: 6,
  },

  deleteButtonText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 17,
    fontWeight: '400',
    color: colors.secondaryText,
    letterSpacing: -0.1,
  },

  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.accent,
    borderRadius: 24,
    gap: 6,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },

  sendButtonText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 17,
    fontWeight: '400',
    color: colors.white,
    letterSpacing: -0.1,
  },
});