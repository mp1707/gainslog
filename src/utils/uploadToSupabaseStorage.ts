import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "@/lib/supabase";

/**
 * Upload an image to Supabase Storage and return the public URL
 * @param localImageUri - Local URI of the image to upload
 * @returns Promise<string> - Public URL of the uploaded image
 * @throws Error if upload fails
 */
export const uploadToSupabaseStorage = async (
  localImageUri: string
): Promise<string> => {
  try {
    // Process and resize image
    const resizedImageUri = await ImageManipulator.manipulateAsync(
      localImageUri,
      [{ resize: { width: 1000 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Generate unique filename
    const filename = `signed/food-image-${Date.now()}.jpg`;

    // Create FormData for upload
    const formData = new FormData();
    formData.append("file", {
      uri: resizedImageUri.uri,
      name: filename,
      type: "image/jpeg",
    } as any);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("food-images")
      .upload(filename, formData, { upsert: false });

    if (uploadError) {
      throw uploadError;
    }

    return filename;
  } catch (error) {
    console.error("Error uploading image to Supabase:", error);
    throw error;
  }
};

// uploadToSupabaseStorage.ts  (only the return value changes)
export const uploadToSupabaseStorageNew = async (
  localImageUri: string
): Promise<string> => {
  // … image manipulation unchanged …
  const resizedImageUri = await ImageManipulator.manipulateAsync(
    localImageUri,
    [{ resize: { width: 1000 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  const filename = `food-image-${Date.now()}.jpg`; // no “public/” prefix
  const { error: uploadError } = await supabase.storage
    .from("food-images")
    .upload(filename, {
      uri: resizedImageUri.uri,
      name: filename,
      type: "image/jpeg",
    } as any);

  if (uploadError) {
    console.error("Error uploading image to Supabase:", uploadError.message);
    throw uploadError;
  }

  // **Return the storage path, not a public URL**
  return filename; // e.g. "food-image-1708459324000.jpg"
};
