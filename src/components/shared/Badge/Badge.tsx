import React from "react";
import { View } from "react-native";
import { CameraIcon } from "phosphor-react-native";
import { LoadingSpinner } from "../LoadingSpinner";
import { AppText } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./Badge.styles";

export interface ConfidenceBadgeProps {
  confidence: number;
  isLoading?: boolean;
}

export interface SemanticBadgeProps {
  variant: "semantic";
  semanticType: "calories" | "protein" | "carbs" | "fat";
  label: string;
  isLoading?: boolean;
}

export interface IconBadgeProps {
  variant: "icon";
  iconType: "image" | "audio" | "text";
  isLoading?: boolean;
}

export type BadgeProps =
  | (ConfidenceBadgeProps & { variant?: "confidence" })
  | SemanticBadgeProps
  | IconBadgeProps;

export const Badge: React.FC<BadgeProps> = (props) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const isLoading = props.isLoading || false;

  if (isLoading) {
    return (
      <View
        style={[styles.base, styles.loading]}
        accessibilityRole="text"
        accessibilityLabel="Loading indicator"
      >
        <LoadingSpinner size="small" />
      </View>
    );
  }

  // Handle semantic variant
  if (props.variant === "semantic") {
    const getSemanticInfo = () => {
      switch (props.semanticType) {
        case "calories":
          return {
            style: styles.semanticCalories,
            textStyle: styles.semanticCaloriesText,
            accessibilityLabel: `Calories: ${props.label}`,
          };
        case "protein":
          return {
            style: styles.semanticProtein,
            textStyle: styles.semanticProteinText,
            accessibilityLabel: `Protein: ${props.label}`,
          };
        case "carbs":
          return {
            style: styles.semanticCarbs,
            textStyle: styles.semanticCarbsText,
            accessibilityLabel: `Carbohydrates: ${props.label}`,
          };
        case "fat":
          return {
            style: styles.semanticFat,
            textStyle: styles.semanticFatText,
            accessibilityLabel: `Fat: ${props.label}`,
          };
        default:
          return {
            style: styles.uncertain,
            textStyle: styles.uncertainText,
            accessibilityLabel: props.label,
          };
      }
    };

    const semanticInfo = getSemanticInfo();

    return (
      <View
        style={[styles.base, semanticInfo.style]}
        accessibilityRole="text"
        accessibilityLabel={semanticInfo.accessibilityLabel}
      >
        <AppText role="Caption" style={[styles.text, semanticInfo.textStyle]}>
          {props.label}
        </AppText>
      </View>
    );
  }

  // Handle icon variant
  if (props.variant === "icon") {
    const getIconInfo = () => {
      switch (props.iconType) {
        case "image":
          return {
            icon: CameraIcon,
            accessibilityLabel: "Image input",
          };
        default:
          return {
            icon: CameraIcon,
            accessibilityLabel: "Input method",
          };
      }
    };

    const iconInfo = getIconInfo();
    const IconComponent = iconInfo.icon;

    return (
      <View
        style={[styles.base, styles.iconBadge]}
        accessibilityRole="image"
        accessibilityLabel={iconInfo.accessibilityLabel}
      >
        <IconComponent size={16} color={colors.accent} />
      </View>
    );
  }

  // Handle confidence variant (default)
  const getConfidenceInfo = () => {
    const confidence = (props as any).confidence || 0;
    // Updated confidence ranges based on design system
    if (confidence >= 80)
      return {
        style: styles.high,
        textStyle: styles.highText,
        label: "High Accuracy",
        range: "80-100%",
      };
    if (confidence >= 60)
      return {
        style: styles.good,
        textStyle: styles.goodText,
        label: "Medium Accuracy",
        range: "60-79%",
      };
    if (confidence >= 40)
      return {
        style: styles.partial,
        textStyle: styles.partialText,
        label: "Low Accuracy",
        range: "40-59%",
      };
    return {
      style: styles.uncertain,
      textStyle: styles.uncertainText,
      label: "Uncertain",
      range: "0-39%",
    };
  };

  const confidenceInfo = getConfidenceInfo();
  const confidence = (props as any).confidence || 0;

  return (
    <View
      style={[styles.base, confidenceInfo.style]}
      accessibilityRole="text"
      accessibilityLabel={`AI confidence ${confidenceInfo.label}: ${confidence}%`}
      accessibilityHint={`Confidence range ${confidenceInfo.range}`}
    >
      <AppText role="Caption" style={[styles.text, confidenceInfo.textStyle]}>
        {confidenceInfo.label}
      </AppText>
    </View>
  );
};
