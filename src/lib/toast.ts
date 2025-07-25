import { Toast } from "toastify-react-native";

/**
 * Shows an error toast message
 */
export const showErrorToast = (message: string) => {
  Toast.error(message, "top");
};

/**
 * Shows a warning toast message for invalid images
 */
export const showInvalidImageToast = () => {
  showErrorToast("Invalid Image, try again.");
};
