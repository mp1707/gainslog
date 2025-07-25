import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  container: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: 320,
    maxWidth: '90%',
    paddingVertical: 24,
    paddingHorizontal: 20,
    // iOS Shadow
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowColor: '#000000',
    // Android Shadow  
    elevation: 10,
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
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    // iOS Shadow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowColor: '#FF3B30',
    // Android Shadow
    elevation: 6,
  },

  stopButton: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },

  recordingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
    letterSpacing: -0.1,
  },

  timerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.5,
    fontFamily: 'SF Mono',
    fontVariant: ['tabular-nums'],
  },

  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 24,
    gap: 6,
  },

  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    letterSpacing: -0.1,
  },

  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 24,
    gap: 6,
    // iOS Shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowColor: '#007AFF',
    // Android Shadow
    elevation: 3,
  },

  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.1,
  },
});