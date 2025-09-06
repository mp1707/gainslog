import { Alert } from "react-native";
import * as ExpoImagePicker from "expo-image-picker";
import { uploadToSupabaseStorage } from "@/utils/uploadToSupabaseStorage";

interface UseImageSelectionOptions {
  onImageSelected: (imageUrl: string) => void;
  onUploadStart: () => void;
  onUploadError: (error: Error) => void;
}

export const useImageSelection = ({
  onImageSelected,
  onUploadStart,
  onUploadError,
}: UseImageSelectionOptions) => {
  const showImagePickerAlert = () => {
    Alert.alert("Select Photo", "Choose how you'd like to add a photo", [
      { text: "Camera", onPress: handleCameraPress },
      { text: "Photo Library", onPress: handleLibraryPress },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleCameraPress = async () => {
    try {
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
      onUploadStart();
      
      const uploadedImageUrl = await uploadToSupabaseStorage(localUri);
      onImageSelected(uploadedImageUrl);
    } catch (error) {
      console.error("Error processing image:", error);
      onUploadError(error as Error);
      
      Alert.alert(
        "Upload Failed",
        "Failed to upload image. Please try again."
      );
    }
  };

  return {
    showImagePickerAlert,
  };
};