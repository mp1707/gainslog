import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { CameraIcon } from "phosphor-react-native";
import * as ExpoImagePicker from "expo-image-picker";
import { useTheme } from "@/theme";
import { createStyles } from "./ImagePicker.styles";
import { uploadToSupabaseStorage } from "@/utils/uploadToSupabaseStorage";

// Extended FoodLog type to include image properties
interface FoodLogWithImage {
  id?: string;
  imageUrl?: string;
  localImageUri?: string;
  isUploading?: boolean;
  [key: string]: any; // Allow other properties
}

interface ImagePickerProps {
  newLog: FoodLogWithImage;
  setNewLog: (log: FoodLogWithImage) => void;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  newLog,
  setNewLog,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleImagePress = () => {
    Alert.alert("Select Photo", "Choose how you'd like to add a photo", [
      { text: "Camera", onPress: handleCameraPress },
      { text: "Photo Library", onPress: handleLibraryPress },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleCameraPress = async () => {
    try {
      // Request camera permissions
      const permissionResult =
        await ExpoImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera access is required to take photos"
        );
        return;
      }

      const result = await ExpoImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) return;

      await processSelectedImage(result.assets[0].uri);
    } catch (error) {
      console.error("Error launching camera:", error);
      Alert.alert("Error", "Failed to access camera");
    }
  };

  const handleLibraryPress = async () => {
    try {
      // Request media library permissions
      const permissionResult =
        await ExpoImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Photo library access is required to select images"
        );
        return;
      }

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) return;

      await processSelectedImage(result.assets[0].uri);
    } catch (error) {
      console.error("Error launching image library:", error);
      Alert.alert("Error", "Failed to access photo library");
    }
  };

  const processSelectedImage = async (localUri: string) => {
    try {
      // Set local image and uploading state
      setNewLog({
        ...newLog,
        localImageUri: localUri,
        isUploading: true,
      });

      // Upload to Supabase
      const uploadedImageUrl = await uploadToSupabaseStorage(localUri);

      // Update with remote URL and clear uploading state
      setNewLog({
        ...newLog,
        imageUrl: uploadedImageUrl,
        localImageUri: undefined,
        isUploading: false,
      });
    } catch (error) {
      console.error("Error processing image:", error);
      
      // Keep local image but clear uploading state
      setNewLog({
        ...newLog,
        isUploading: false,
      });
      
      Alert.alert(
        "Upload Failed",
        "Failed to upload image. You can still save this entry with the local image."
      );
    }
  };

  const imageSource = newLog.imageUrl || newLog.localImageUri;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleImagePress}
      accessibilityRole="button"
      accessibilityLabel="Add or change food photo"
    >
      {imageSource ? (
        <Image source={{ uri: imageSource }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <CameraIcon size={32} color={colors.secondaryText} />
          <Text style={styles.placeholderText}>
            Add Photo
          </Text>
        </View>
      )}

      {newLog.isUploading && (
        <View style={styles.uploadingOverlay}>
          <Text style={styles.uploadingText}>
            Uploading...
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};