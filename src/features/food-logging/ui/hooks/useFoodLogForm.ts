import { useState, useEffect } from 'react';
import { FoodLog, ModalMode } from '@/types';

export interface FoodLogFormData {
  title: string;
  description: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface UseFoodLogFormReturn {
  formData: FoodLogFormData;
  validationError: string;
  setValidationError: (error: string) => void;
  updateField: (field: keyof FoodLogFormData, value: string) => void;
  resetForm: () => void;
  initializeForm: (log: FoodLog | null, mode: ModalMode) => void;
}

/**
 * Custom hook for managing food log form state
 * Consolidates all form fields and handles initialization/reset logic
 */
export function useFoodLogForm(): UseFoodLogFormReturn {
  const [formData, setFormData] = useState<FoodLogFormData>({
    title: '',
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  const [validationError, setValidationError] = useState('');

  const updateField = (field: keyof FoodLogFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear validation error when user types
    if (validationError) {
      setValidationError('');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    });
    setValidationError('');
  };

  const initializeForm = (currentLog: FoodLog | null, mode: ModalMode) => {
    if (currentLog) {
      // For audio logs being transcribed, keep title field empty for user input
      // For other logs, use generatedTitle as fallback
      const titleValue = currentLog.userTitle || 
        (currentLog.isTranscribing ? '' : currentLog.generatedTitle) || '';
      
      setFormData({
        title: titleValue,
        description: currentLog.userDescription || '',
        calories: currentLog.userCalories?.toString() || '',
        protein: currentLog.userProtein?.toString() || '',
        carbs: currentLog.userCarbs?.toString() || '',
        fat: currentLog.userFat?.toString() || '',
      });
    } else if (mode === 'create') {
      resetForm();
    }
    
    // Clear validation error when form resets
    setValidationError('');
  };

  return {
    formData,
    validationError,
    setValidationError,
    updateField,
    resetForm,
    initializeForm,
  };
}