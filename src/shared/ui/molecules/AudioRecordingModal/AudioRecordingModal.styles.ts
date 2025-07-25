import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },

  cancelButton: {
    fontSize: 16,
    fontWeight: '400',
    color: '#007AFF',
    letterSpacing: -0.1,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.2,
  },

  headerSpacer: {
    width: 50, // Balance the cancel button
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  controlsContainer: {
    alignItems: 'center',
    width: '100%',
  },

  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    // iOS Shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowColor: '#007AFF',
    // Android Shadow
    elevation: 8,
  },

  recordingButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    // iOS Shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowColor: '#FF3B30',
    // Android Shadow
    elevation: 8,
  },

  stopButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  instructionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    letterSpacing: -0.1,
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
    fontSize: 32,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.5,
    fontFamily: 'SF Mono',
    fontVariant: ['tabular-nums'],
  },

  actionButtons: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 16,
  },

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fee2e2',
    borderRadius: 28,
    gap: 8,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    gap: 8,
    // iOS Shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowColor: '#007AFF',
    // Android Shadow
    elevation: 4,
  },

  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.1,
  },
});