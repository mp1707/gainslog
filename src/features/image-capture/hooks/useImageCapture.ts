import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase';
import { FoodLog } from '../../../types';
import { generateFoodLogId } from '../../../lib/storage';

export const useImageCapture = () => {
  const [isUploading, setIsUploading] = useState(false);

  const captureImage = async (): Promise<FoodLog | null> => {
    try {
      setIsUploading(true);

      // Request camera permissions first
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        throw new Error('Camera permission not granted');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return null;

      // Process and resize image
      const resizedImageUri = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1000 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Upload to Supabase Storage
      const filename = `public/food-image-${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append('file', {
        uri: resizedImageUri.uri,
        name: filename,
        type: 'image/jpeg',
      } as any);

      const { error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(filename, formData);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('food-images')
        .getPublicUrl(filename);

      // Create food log with image
      const newLog: FoodLog = {
        id: generateFoodLogId(),
        generatedTitle: '',
        estimationConfidence: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        imageUrl: publicUrlData.publicUrl,
        createdAt: new Date().toISOString(),
      };

      return newLog;
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture and upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    captureImage,
  };
};