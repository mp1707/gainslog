import React from "react";
import { ActivityIndicator } from "react-native";
import { useTheme } from "@/theme";

export interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "small",
  color,
}) => {
  const { colors } = useTheme();
  const spinnerColor = color || colors.secondaryText;

  return <ActivityIndicator size={size} color={spinnerColor} />;
};
