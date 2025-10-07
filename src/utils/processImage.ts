import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { uploadToSupabaseStorage } from "./uploadToSupabaseStorage";

export interface ProcessedImageResult {
  localImagePath: string;
  supabaseImagePath: string;
}

/**
 * Processes an image by resizing, compressing, saving locally, and uploading to Supabase
 * @param uri - The original image URI to process
 * @returns Promise<ProcessedImageResult> - Object containing local and Supabase image paths
 * @throws Error if image processing fails
 */
export const processImage = async (
  uri: string
): Promise<ProcessedImageResult> => {
  // Resize the image to a max width of 1000px, maintaining aspect ratio.
  const resizedImage = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1000 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  const uniqueFilename = `${uuidv4()}.jpg`;
  // Define the permanent path in the app's sandboxed document directory.
  const permanentPath = `${FileSystem.documentDirectory}${uniqueFilename}`;

  // Move the resized image from its temporary cache location to the permanent path.
  await FileSystem.moveAsync({
    from: resizedImage.uri,
    to: permanentPath,
  });

  const supabaseImagePath = await uploadToSupabaseStorage(permanentPath);

  return {
    localImagePath: permanentPath,
    supabaseImagePath,
  };
};
