import React, { useEffect } from 'react';
import { useFoodLogStore } from '../../../stores/useFoodLogStore';
import { useImageCapture } from '../../image-capture';

export interface ActionTriggerHandlerProps {
  onManualLog: () => void;
  onImageCaptured: (log: any) => void;
}

export function ActionTriggerHandler({
  onManualLog,
  onImageCaptured,
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

  return null; // This is a logical component, renders nothing when not triggered
}