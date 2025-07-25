import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase';
import { FoodLog } from '../../../types';
import { generateFoodLogId } from '../../../lib/storage';
import { useFoodLogStore } from '../../../stores/useFoodLogStore';

// Helper function to convert Date to local date string (YYYY-MM-DD)
const dateToLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useImageCapture = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { selectedDate } = useFoodLogStore();

  const processAndUploadImage = async (imageUri: string): Promise<FoodLog | null> => {
    try {
      // Process and resize image
      const resizedImageUri = await ImageManipulator.manipulateAsync(
        imageUri,
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

      // Create food log with image using selected date
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
        date: selectedDate,
      };

      return newLog;
    } catch (error) {
      console.error('Error processing and uploading image:', error);
      Alert.alert('Error', 'Failed to process and upload image');
      return null;
    }
  };

  const launchCamera = async (): Promise<FoodLog | null> => {
    try {
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is required to take photos');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return null;

      return await processAndUploadImage(result.assets[0].uri);
    } catch (error) {
      console.error('Error launching camera:', error);
      Alert.alert('Error', 'Failed to access camera');
      return null;
    }
  };

  const launchImageLibrary = async (): Promise<FoodLog | null> => {
    try {
      // Request media library permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library access is required to select images');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return null;

      return await processAndUploadImage(result.assets[0].uri);
    } catch (error) {
      console.error('Error launching image library:', error);
      Alert.alert('Error', 'Failed to access photo library');
      return null;
    }
  };

  const showImagePicker = async (): Promise<FoodLog | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Image Source',
        'Choose how you want to add an image',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              setIsUploading(true);
              const result = await launchCamera();
              setIsUploading(false);
              resolve(result);
            },
          },
          {
            text: 'Choose from Library',
            onPress: async () => {
              setIsUploading(true);
              const result = await launchImageLibrary();
              setIsUploading(false);
              resolve(result);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ]
      );
    });
  };

  // Keep the old method name for backward compatibility
  const captureImage = showImagePicker;

  return {
    isUploading,
    captureImage,
    showImagePicker,
    launchCamera,
    launchImageLibrary,
  };
};