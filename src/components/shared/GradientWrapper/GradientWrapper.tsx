import React from "react";
import { ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/theme";
import { createStyles } from "./GradientWrapper.styles";

interface GradientWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: [string, string];
}

export const GradientWrapper: React.FC<GradientWrapperProps> = ({
  children,
  style,
  colors: customColors,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const gradientColors = customColors || [colors.secondaryBackground, colors.primaryBackground];

  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};