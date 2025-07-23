import React, { createContext, useContext, ReactNode, useState } from 'react';
import { FoodLog } from '../../../types';

type ActionType = 'manual' | 'image' | 'audio' | null;

interface GlobalFoodLogActionsContextType {
  triggerAction: ActionType;
  setTriggerAction: (action: ActionType) => void;
  triggerManualLog: () => void;
  triggerImageCapture: () => void;
  triggerAudioRecord: () => void;
}

const GlobalFoodLogActionsContext = createContext<GlobalFoodLogActionsContextType | null>(null);

interface GlobalFoodLogActionsProviderProps {
  children: ReactNode;
}

export function GlobalFoodLogActionsProvider({
  children,
}: GlobalFoodLogActionsProviderProps) {
  const [triggerAction, setTriggerAction] = useState<ActionType>(null);

  const value = {
    triggerAction,
    setTriggerAction,
    triggerManualLog: () => setTriggerAction('manual'),
    triggerImageCapture: () => setTriggerAction('image'),
    triggerAudioRecord: () => setTriggerAction('audio'),
  };

  return (
    <GlobalFoodLogActionsContext.Provider value={value}>
      {children}
    </GlobalFoodLogActionsContext.Provider>
  );
}

export function useGlobalFoodLogActions() {
  const context = useContext(GlobalFoodLogActionsContext);
  if (!context) {
    throw new Error('useGlobalFoodLogActions must be used within a GlobalFoodLogActionsProvider');
  }
  return context;
}