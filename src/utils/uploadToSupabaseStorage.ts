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
    // Generate unique filename
    const filename = `signed/food-image-${Date.now()}.jpg`;

    // Create FormData for upload
    const formData = new FormData();
    formData.append("file", {
      uri: localImageUri,
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
