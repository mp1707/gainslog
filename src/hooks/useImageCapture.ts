import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "@/lib/supabase";
import { FoodLog } from "@/types";
import { generateFoodLogId } from "@/utils/idGenerator";
import { useAppStore } from "@/store";

export const useImageCapture = () => {
  const [isUploading, setIsUploading] = useState(false);
  const selectedDate = useAppStore((s) => s.selectedDate);

  const createPartialLog = (localImageUri: string): FoodLog => {
    return {
      id: generateFoodLogId(),
      generatedTitle: "",
      estimationConfidence: 0,
      localImageUri,
      isUploading: true,
      createdAt: new Date().toISOString(),
      date: selectedDate,
    };
  };

  const uploadImageInBackground = async (
    log: FoodLog,
    imageUri: string,
    onUpdated?: (updated: FoodLog) => void
  ) => {
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
      formData.append("file", {
        uri: resizedImageUri.uri,
        name: filename,
        type: "image/jpeg",
      } as any);

      const { error: uploadError } = await supabase.storage
        .from("food-images")
        .upload(filename, formData, { upsert: false });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from("food-images")
        .getPublicUrl(filename);
      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to obtain public URL");
      }

      // Update the log with uploaded image URL
      const updatedLog: FoodLog = {
        ...log,
        imageUrl: publicUrlData.publicUrl,
        isUploading: false,
        localImageUri: undefined, // Clear local URI after successful upload
      };
      onUpdated?.(updatedLog);
    } catch (error) {
      console.error("Error processing and uploading image:", error);

      // Update log to show upload failed
      const failedLog: FoodLog = {
        ...log,
        isUploading: false,
        // Keep local URI so user can retry
      };
      onUpdated?.(failedLog);
      Alert.alert(
        "Upload Failed",
        "Failed to upload image. You can still save this entry with the local image."
      );
    }
  };

  const launchCamera = async (
    onProgressUpdate?: (updated: FoodLog) => void
  ): Promise<FoodLog | null> => {
    try {
      // Request camera permissions
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera access is required to take photos"
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) return null;

      // Create partial log for modal (do NOT add to main list yet)
      const partialLog = createPartialLog(result.assets[0].uri);

      // Start background upload and provide updates to caller (modal)
      uploadImageInBackground(
        partialLog,
        result.assets[0].uri,
        onProgressUpdate
      );

      return partialLog;
    } catch (error) {
      console.error("Error launching camera:", error);
      Alert.alert("Error", "Failed to access camera");
      return null;
    }
  };

  const launchImageLibrary = async (
    onProgressUpdate?: (updated: FoodLog) => void
  ): Promise<FoodLog | null> => {
    try {
      // Request media library permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Photo library access is required to select images"
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) return null;

      // Create partial log for modal (do NOT add to main list yet)
      const partialLog = createPartialLog(result.assets[0].uri);

      // Start background upload and provide updates to caller (modal)
      uploadImageInBackground(
        partialLog,
        result.assets[0].uri,
        onProgressUpdate
      );

      return partialLog;
    } catch (error) {
      console.error("Error launching image library:", error);
      Alert.alert("Error", "Failed to access photo library");
      return null;
    }
  };

  return {
    isUploading,
    launchCamera,
    launchImageLibrary,
  };
};
