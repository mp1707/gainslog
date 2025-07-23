import { create } from 'zustand';
import { Alert } from 'react-native';
import { FoodLog } from '../types';
import { 
  getFoodLogs, 
  saveFoodLog, 
  updateFoodLog, 
  deleteFoodLog 
} from '@/lib/storage';

type ActionType = 'manual' | 'image' | null;

interface FoodLogStore {
  // Data state
  foodLogs: FoodLog[];
  isLoadingLogs: boolean;
  
  // Date filtering state
  selectedDate: string; // ISO date string (YYYY-MM-DD)
  
  // Action trigger state  
  triggerAction: ActionType;
  
  // Data actions
  loadFoodLogs: () => Promise<void>;
  addFoodLog: (log: FoodLog) => Promise<void>;
  updateFoodLogById: (log: FoodLog) => Promise<void>;
  deleteFoodLogById: (logId: string) => Promise<void>;
  
  // State-only updates (for optimistic UI updates)
  updateFoodLogInState: (log: FoodLog) => void;
  addFoodLogToState: (log: FoodLog) => void;
  removeFoodLogFromState: (logId: string) => void;
  
  // Action triggers
  triggerManualLog: () => void;
  triggerImageCapture: () => void;
  setTriggerAction: (action: ActionType) => void;
  clearTrigger: () => void;
  
  // Date actions
  setSelectedDate: (date: string) => void;
  getFilteredFoodLogs: () => FoodLog[];
}

// Helper function to get today's date in ISO format (YYYY-MM-DD) in local timezone
const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to convert Date to local date string (YYYY-MM-DD)
const dateToLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useFoodLogStore = create<FoodLogStore>((set, get) => ({
  // Initial state
  foodLogs: [],
  isLoadingLogs: true,
  selectedDate: getTodayDateString(),
  triggerAction: null,
  
  // Data actions
  loadFoodLogs: async () => {
    set({ isLoadingLogs: true });
    try {
      const logs = await getFoodLogs();
      
      // Ensure backward compatibility by adding date field to logs that don't have it
      const migratedLogs = logs.map(log => ({
        ...log,
        date: log.date || dateToLocalDateString(new Date(log.createdAt))
      }));
      
      set({ foodLogs: migratedLogs });
    } catch (error) {
      console.error('Error loading food logs:', error);
      Alert.alert('Error', 'Failed to load food logs from storage');
    } finally {
      set({ isLoadingLogs: false });
    }
  },

  addFoodLog: async (log: FoodLog) => {
    try {
      await saveFoodLog(log);
      const { foodLogs } = get();
      
      // Check if log already exists in state
      const existingIndex = foodLogs.findIndex(item => item.id === log.id);
      
      if (existingIndex !== -1) {
        // Replace existing log
        const updated = [...foodLogs];
        updated[existingIndex] = log;
        set({ foodLogs: updated });
      } else {
        // Add new log
        set({ foodLogs: [log, ...foodLogs] });
      }
    } catch (error) {
      console.error('Error adding food log:', error);
      throw error;
    }
  },

  updateFoodLogById: async (log: FoodLog) => {
    try {
      await updateFoodLog(log);
      const { foodLogs } = get();
      
      set({ 
        foodLogs: foodLogs.map(item => item.id === log.id ? log : item)
      });
    } catch (error) {
      console.error('Error updating food log:', error);
      throw error;
    }
  },

  deleteFoodLogById: async (logId: string) => {
    try {
      await deleteFoodLog(logId);
      const { foodLogs } = get();
      
      set({ 
        foodLogs: foodLogs.filter(log => log.id !== logId)
      });
    } catch (error) {
      console.error('Error deleting food log:', error);
      Alert.alert('Error', 'Failed to delete food log. Please try again.');
      throw error;
    }
  },

  // State-only updates (for optimistic UI updates)
  updateFoodLogInState: (log: FoodLog) => {
    const { foodLogs } = get();
    set({ 
      foodLogs: foodLogs.map(item => item.id === log.id ? log : item)
    });
  },

  addFoodLogToState: (log: FoodLog) => {
    const { foodLogs } = get();
    
    // Check if log already exists in state
    const existingIndex = foodLogs.findIndex(item => item.id === log.id);
    
    if (existingIndex !== -1) {
      // Replace existing log
      const updated = [...foodLogs];
      updated[existingIndex] = log;
      set({ foodLogs: updated });
    } else {
      // Add new log
      set({ foodLogs: [log, ...foodLogs] });
    }
  },

  removeFoodLogFromState: (logId: string) => {
    const { foodLogs } = get();
    set({ 
      foodLogs: foodLogs.filter(log => log.id !== logId)
    });
  },

  // Action triggers
  triggerManualLog: () => set({ triggerAction: 'manual' }),
  triggerImageCapture: () => set({ triggerAction: 'image' }),
  setTriggerAction: (action: ActionType) => set({ triggerAction: action }),
  clearTrigger: () => set({ triggerAction: null }),
  
  // Date actions
  setSelectedDate: (date: string) => set({ selectedDate: date }),
  
  getFilteredFoodLogs: () => {
    const { foodLogs, selectedDate } = get();
    return foodLogs.filter(log => log.date === selectedDate);
  },
}));

// Export ActionType for components that need it
export type { ActionType };