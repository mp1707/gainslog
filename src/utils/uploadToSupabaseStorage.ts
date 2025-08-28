import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "@/lib/supabase";

/**
 * Upload an image to Supabase Storage and return the public URL
 * @param localImageUri - Local URI of the image to upload
 * @returns Promise<string> - Public URL of the uploaded image
 * @throws Error if upload fails
 */
export const uploadToSupabaseStorage = async (localImageUri: string): Promise<string> => {
  try {
    // Process and resize image
    const resizedImageUri = await ImageManipulator.manipulateAsync(
      localImageUri,
      [{ resize: { width: 1000 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Generate unique filename
    const filename = `public/food-image-${Date.now()}.jpg`;
    
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

    // Get the public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from("food-images")
      .getPublicUrl(filename);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Failed to obtain public URL");
    }

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image to Supabase:", error);
    throw error;
  }
};