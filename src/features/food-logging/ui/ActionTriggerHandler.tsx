import React, { useEffect } from 'react';
import { useFoodLogActions } from '../providers/FoodLogActionsProvider';
import { useGlobalFoodLogActions } from '../providers/GlobalFoodLogActionsProvider';
import { useImageCapture } from '../../image-capture';
import { AudioRecordingButton } from '../../audio-recording';

export function ActionTriggerHandler() {
  const localActions = useFoodLogActions();
  const globalActions = useGlobalFoodLogActions();
  const { captureImage } = useImageCapture();

  useEffect(() => {
    if (globalActions.triggerAction === 'manual') {
      localActions.handleManualLog();
      globalActions.setTriggerAction(null);
    } else if (globalActions.triggerAction === 'image') {
      handleImageCapture();
      globalActions.setTriggerAction(null);
    }
  }, [globalActions.triggerAction, localActions, globalActions]);

  const handleImageCapture = async () => {
    try {
      const log = await captureImage();
      if (log) {
        localActions.handleImageCaptured(log);
      }
    } catch (error) {
      console.error('Image capture failed:', error);
    }
  };

  // Render the audio recording button when triggered
  // This is needed because the audio recording requires modal state management
  if (globalActions.triggerAction === 'audio') {
    return (
      <AudioRecordingButton
        onAudioRecorded={(log) => {
          localActions.handleAudioRecorded(log);
          globalActions.setTriggerAction(null);
        }}
      />
    );
  }

  return null; // This is a logical component, renders nothing when not triggered
}