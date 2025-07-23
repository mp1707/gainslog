import React, { useEffect } from 'react';
import { useFoodLogStore } from '../../../stores/useFoodLogStore';
import { useImageCapture } from '../../image-capture';
import { AudioRecordingButton } from '../../audio-recording';

export interface ActionTriggerHandlerProps {
  onManualLog: () => void;
  onImageCaptured: (log: any) => void;
  onAudioRecorded: (log: any) => void;
}

export function ActionTriggerHandler({
  onManualLog,
  onImageCaptured,
  onAudioRecorded,
}: ActionTriggerHandlerProps) {
  const { triggerAction, clearTrigger } = useFoodLogStore();
  const { captureImage } = useImageCapture();

  useEffect(() => {
    if (triggerAction === 'manual') {
      onManualLog();
      clearTrigger();
    } else if (triggerAction === 'image') {
      handleImageCapture();
      clearTrigger();
    }
  }, [triggerAction, onManualLog, clearTrigger]);

  const handleImageCapture = async () => {
    try {
      const log = await captureImage();
      if (log) {
        onImageCaptured(log);
      }
    } catch (error) {
      console.error('Image capture failed:', error);
    }
  };

  // Render the audio recording button when triggered
  // This is needed because the audio recording requires modal state management
  if (triggerAction === 'audio') {
    return (
      <AudioRecordingButton
        onAudioRecorded={(log) => {
          onAudioRecorded(log);
          clearTrigger();
        }}
      />
    );
  }

  return null; // This is a logical component, renders nothing when not triggered
}