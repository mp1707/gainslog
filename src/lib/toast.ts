import { Toast } from "toastify-react-native";

/**
 * Shows an error toast message
 */
export const showErrorToast = (message: string) => {
  // Ensure consistent placement and styling; use theme tokens for colors if supported by the library
  Toast.error(message, "top");
};

/**
 * Shows a warning toast message for invalid images
 */
export const showInvalidImageToast = () => {
  showErrorToast("Invalid Image, try again.");
};

export const showSuccessToast = (message: string) => {
  Toast.success(message, "top");
};

export const showInfoToast = (message: string) => {
  Toast.info(message, "top");
};
