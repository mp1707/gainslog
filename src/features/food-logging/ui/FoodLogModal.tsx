import React, { useState, useEffect } from 'react';
import { Modal, SafeAreaView, View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FormField, NutritionGrid } from '@/shared/ui';
import { FoodLog, ModalMode } from '../../../types';
import { mergeNutritionData } from '../utils';
import { estimateNutritionTextBased, estimateNutritionImageBased } from '@/lib/supabase';
import { styles } from './FoodLogModal.styles';

interface FoodLogModalProps {
  visible: boolean;
  mode: ModalMode;
  selectedLog: FoodLog | null;
  onClose: () => void;
  onSave: (log: FoodLog) => void;
}

export const FoodLogModal: React.FC<FoodLogModalProps> = ({
  visible,
  mode,
  selectedLog,
  onClose,
  onSave,
}) => {
  const [tempTitle, setTempTitle] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [tempCalories, setTempCalories] = useState('');
  const [tempProtein, setTempProtein] = useState('');
  const [tempCarbs, setTempCarbs] = useState('');
  const [tempFat, setTempFat] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (visible && selectedLog) {
      setTempTitle(selectedLog.userTitle || selectedLog.generatedTitle || '');
      setTempDescription(selectedLog.userDescription || '');
      setTempCalories(selectedLog.userCalories?.toString() || '');
      setTempProtein(selectedLog.userProtein?.toString() || '');
      setTempCarbs(selectedLog.userCarbs?.toString() || '');
      setTempFat(selectedLog.userFat?.toString() || '');
    } else if (visible && mode === 'create') {
      setTempTitle('');
      setTempDescription('');
      setTempCalories('');
      setTempProtein('');
      setTempCarbs('');
      setTempFat('');
    }
  }, [visible, selectedLog, mode]);

  const handleSave = async () => {
    // Validate required fields for create mode - title is optional for image logs
    const isImageLog = selectedLog?.imageUrl;
    if (mode === 'create' && !isImageLog && !tempTitle.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    setIsEstimating(true);

    try {
      // Get nutrition data from user input and determine if AI estimation is needed
      const nutritionData = mergeNutritionData(tempCalories, tempProtein, tempCarbs, tempFat);

      // Validate nutrition input
      if (!nutritionData.isValid) {
        Alert.alert('Validation Error', nutritionData.validationErrors.join('\n'));
        setIsEstimating(false);
        return;
      }

      let finalLog: FoodLog;

      if (mode === 'create' && selectedLog) {
        // Processing existing log (image log)
        finalLog = {
          ...selectedLog,
          userTitle: tempTitle.trim() || undefined,
          userDescription: tempDescription.trim() || undefined,
          calories: nutritionData.calories,
          protein: nutritionData.protein,
          carbs: nutritionData.carbs,
          fat: nutritionData.fat,
          userCalories: nutritionData.userCalories,
          userProtein: nutritionData.userProtein,
          userCarbs: nutritionData.userCarbs,
          userFat: nutritionData.userFat,
        };
      } else {
        // Creating completely new log (manual entry)
        const newId = `food_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        finalLog = {
          id: newId,
          generatedTitle: tempTitle.trim() || 'Manual entry',
          estimationConfidence: nutritionData.needsAiEstimation ? 0 : 100,
          calories: nutritionData.calories,
          protein: nutritionData.protein,
          carbs: nutritionData.carbs,
          fat: nutritionData.fat,
          userTitle: tempTitle.trim() || undefined,
          userDescription: tempDescription.trim() || undefined,
          userCalories: nutritionData.userCalories,
          userProtein: nutritionData.userProtein,
          userCarbs: nutritionData.userCarbs,
          userFat: nutritionData.userFat,
          createdAt: new Date().toISOString(),
        };
      }

      // Call AI estimation if needed
      if (nutritionData.needsAiEstimation) {
        let estimation;
        if (finalLog.imageUrl) {
          // Use image-based estimation
          estimation = await estimateNutritionImageBased({
            imageUrl: finalLog.imageUrl,
            title: tempTitle.trim() || undefined,
            description: tempDescription.trim() || undefined,
          });
        } else {
          // Use text-based estimation
          estimation = await estimateNutritionTextBased({
            title: tempTitle.trim(),
            description: tempDescription.trim() || undefined,
          });
        }

        // Merge AI data with user input (user input takes precedence)
        const mergedNutrition = mergeNutritionData(
          tempCalories, 
          tempProtein, 
          tempCarbs, 
          tempFat, 
          estimation
        );

        finalLog = {
          ...finalLog,
          generatedTitle: tempTitle.trim() || estimation.generatedTitle,
          estimationConfidence: estimation.estimationConfidence,
          calories: mergedNutrition.calories,
          protein: mergedNutrition.protein,
          carbs: mergedNutrition.carbs,
          fat: mergedNutrition.fat,
          userCalories: mergedNutrition.userCalories,
          userProtein: mergedNutrition.userProtein,
          userCarbs: mergedNutrition.userCarbs,
          userFat: mergedNutrition.userFat,
        };
      }

      onSave(finalLog);
      onClose();
    } catch (error) {
      console.error('Error saving food log:', error);
      Alert.alert('Error', 'Failed to save food log. Please try again.');
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {mode === 'create' ? 'Add Food Log' : 'Add Info'}
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={isEstimating}>
            <Text style={[styles.saveButton, isEstimating && styles.saveButtonDisabled]}>
              {isEstimating ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {selectedLog?.imageUrl && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: selectedLog.imageUrl }} 
                style={styles.foodImage}
                resizeMode="cover"
              />
            </View>
          )}

          <FormField
            label={`Title${selectedLog?.imageUrl ? ' (Optional)' : ''}`}
            value={tempTitle}
            onChangeText={setTempTitle}
            placeholder={selectedLog?.imageUrl ? 'Enter food title (AI will generate if empty)' : 'Enter food title'}
          />

          <FormField
            label="Description (Optional)"
            value={tempDescription}
            onChangeText={setTempDescription}
            placeholder="Add details about preparation, ingredients, portion size, etc."
            multiline={true}
          />

          <NutritionGrid
            calories={tempCalories}
            protein={tempProtein}
            carbs={tempCarbs}
            fat={tempFat}
            onCaloriesChange={setTempCalories}
            onProteinChange={setTempProtein}
            onCarbsChange={setTempCarbs}
            onFatChange={setTempFat}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};