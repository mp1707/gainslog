import React from 'react';
import { ImageCaptureButton } from '../../../image-capture';
import { AudioRecordingButton } from '../../../audio-recording';
import { ManualEntryButton } from '../../../../shared/ui';
import { FoodLog } from '../../../../types';

export interface FloatingActionButtonsProps {
  onManualLog: () => void;
  onImageCaptured: (log: FoodLog) => void;
  onAudioRecorded: (log: FoodLog) => void;
}

/**
 * Container for floating action buttons
 * Groups all food logging input methods in one place
 */
export function FloatingActionButtons({
  onManualLog,
  onImageCaptured,
  onAudioRecorded,
}: FloatingActionButtonsProps) {
  return (
    <>
      <ManualEntryButton onPress={onManualLog} />
      <AudioRecordingButton onAudioRecorded={onAudioRecorded} />
      <ImageCaptureButton onImageCaptured={onImageCaptured} />
    </>
  );
}