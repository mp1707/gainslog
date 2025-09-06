import { Toast } from "toastify-react-native";

/**
 * Shows an error toast message using custom themed component
 */
export const showErrorToast = (message: string, subtitle?: string) => {
  Toast.show({
    type: "error",
    text1: message,
    text2: subtitle,
    position: "top",
  });
};

/**
 * Shows a warning toast message for invalid images
 */
export const showInvalidImageToast = () => {
  showErrorToast("Invalid Image", "Please try again with a different photo.");
};

/**
 * Shows a favorite added toast using custom themed component
 */
export const showFavoriteAddedToast = (
  message: string = "Favorite added",
  meal: string
) => {
  Toast.show({
    type: "favoriteAdded" as any,
    text1: message,
    text2: meal,
    position: "top",
  });
};

/**
 * Shows a favorite removed toast using custom themed component
 */
export const showFavoriteRemovedToast = (
  message: string = "Favorite removed",
  meal: string
) => {
  Toast.show({
    type: "favoriteRemoved" as any,
    text1: message,
    text2: meal,
    position: "top",
  });
};
