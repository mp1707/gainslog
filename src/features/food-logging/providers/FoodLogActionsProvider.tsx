import React, { createContext, useContext, ReactNode, useState } from 'react';
import { FoodLog } from '../../../types';

type ActionType = 'manual' | 'image' | 'audio' | null;

interface FoodLogActionsContextType {
  handleManualLog: () => void;
  handleImageCaptured: (log: FoodLog) => void;
  handleAudioRecorded: (log: FoodLog) => void;
  triggerAction: ActionType;
  setTriggerAction: (action: ActionType) => void;
  triggerImageCapture: () => void;
  triggerAudioRecord: () => void;
}

const FoodLogActionsContext = createContext<FoodLogActionsContextType | null>(null);

interface FoodLogActionsProviderProps {
  children: ReactNode;
  onManualLog: () => void;
  onImageCaptured: (log: FoodLog) => void;
  onAudioRecorded: (log: FoodLog) => void;
}

export function FoodLogActionsProvider({
  children,
  onManualLog,
  onImageCaptured,
  onAudioRecorded,
}: FoodLogActionsProviderProps) {
  const [triggerAction, setTriggerAction] = useState<ActionType>(null);

  const value = {
    handleManualLog: onManualLog,
    handleImageCaptured: onImageCaptured,
    handleAudioRecorded: onAudioRecorded,
    triggerAction,
    setTriggerAction,
    triggerImageCapture: () => setTriggerAction('image'),
    triggerAudioRecord: () => setTriggerAction('audio'),
  };

  return (
    <FoodLogActionsContext.Provider value={value}>
      {children}
    </FoodLogActionsContext.Provider>
  );
}

export function useFoodLogActions() {
  const context = useContext(FoodLogActionsContext);
  if (!context) {
    throw new Error('useFoodLogActions must be used within a FoodLogActionsProvider');
  }
  return context;
}