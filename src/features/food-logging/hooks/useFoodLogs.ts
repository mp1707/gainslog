import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { FoodLog } from '../../../types';
import { 
  getFoodLogs, 
  saveFoodLog, 
  updateFoodLog, 
  deleteFoodLog 
} from '@/lib/storage';

export const useFoodLogs = () => {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // Load food logs from AsyncStorage on initialization
  useEffect(() => {
    const loadFoodLogs = async () => {
      try {
        const logs = await getFoodLogs();
        setFoodLogs(logs);
      } catch (error) {
        console.error('Error loading food logs:', error);
        Alert.alert('Error', 'Failed to load food logs from storage');
      } finally {
        setIsLoadingLogs(false);
      }
    };

    loadFoodLogs();
  }, []);

  const addFoodLog = async (log: FoodLog) => {
    try {
      await saveFoodLog(log);
      setFoodLogs(prev => {
        // Check if log already exists in state
        const existingIndex = prev.findIndex(item => item.id === log.id);
        if (existingIndex !== -1) {
          // Replace existing log
          const updated = [...prev];
          updated[existingIndex] = log;
          return updated;
        } else {
          // Add new log
          return [log, ...prev];
        }
      });
    } catch (error) {
      console.error('Error adding food log:', error);
      throw error;
    }
  };

  const updateFoodLogById = async (log: FoodLog) => {
    try {
      await updateFoodLog(log);
      setFoodLogs(prev => 
        prev.map(item => item.id === log.id ? log : item)
      );
    } catch (error) {
      console.error('Error updating food log:', error);
      throw error;
    }
  };

  const deleteFoodLogById = async (logId: string) => {
    try {
      await deleteFoodLog(logId);
      setFoodLogs(prev => prev.filter(log => log.id !== logId));
    } catch (error) {
      console.error('Error deleting food log:', error);
      Alert.alert('Error', 'Failed to delete food log. Please try again.');
      throw error;
    }
  };

  const updateFoodLogInState = (log: FoodLog) => {
    setFoodLogs(prev => 
      prev.map(item => item.id === log.id ? log : item)
    );
  };

  const addFoodLogToState = (log: FoodLog) => {
    setFoodLogs(prev => {
      // Check if log already exists in state
      const existingIndex = prev.findIndex(item => item.id === log.id);
      if (existingIndex !== -1) {
        // Replace existing log
        const updated = [...prev];
        updated[existingIndex] = log;
        return updated;
      } else {
        // Add new log
        return [log, ...prev];
      }
    });
  };

  const removeFoodLogFromState = (logId: string) => {
    setFoodLogs(prev => prev.filter(log => log.id !== logId));
  };

  return {
    foodLogs,
    isLoadingLogs,
    addFoodLog,
    updateFoodLogById,
    deleteFoodLogById,
    updateFoodLogInState,
    addFoodLogToState,
    removeFoodLogFromState,
  };
};