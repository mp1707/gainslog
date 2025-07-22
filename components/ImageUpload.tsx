import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "../lib/supabase";

export const ImageUpload = () => {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const originalUri = await handleImagePicking();
      if (!originalUri) return;

      const resizedImageUri = await resizeImage(originalUri);
      setImage(resizedImageUri);
      setError(null);
    } catch (err) {
      setError("Failed to pick or process image");
      console.error("Error picking/processing image:", err);
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    try {
      setUploading(true);
      setError(null);

      const formData = createImageFormData(image);
      await uploadImageToSupabase(formData);
      setImage(null);
    } catch (err) {
      setError("Failed to upload image");
      console.error("Error uploading image:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.pickButton}
        onPress={pickImage}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>Pick an Image</Text>
      </TouchableOpacity>

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={uploadImage}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Upload Image</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  pickButton: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  imageContainer: {
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  errorText: {
    color: "#ef4444",
    marginTop: 10,
  },
});

const handleImagePicking = async (): Promise<string | null> => {
  // Request media library permissions first
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (permissionResult.status !== 'granted') {
    throw new Error('Media library permission not granted');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 1,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
};

const resizeImage = async (uri: string): Promise<string> => {
  const manipulatedImage = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1000 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipulatedImage.uri;
};

const createImageFormData = (uri: string): FormData => {
  const formData = new FormData();
  const filename = `public/image-${Date.now()}.jpg`;

  formData.append("file", {
    uri,
    name: filename,
    type: "image/jpeg",
  } as any);

  return formData;
};

const uploadImageToSupabase = async (formData: FormData): Promise<void> => {
  const filename = `public/image-${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("food-images")
    .upload(filename, formData);

  if (uploadError) {
    throw uploadError;
  }
};
