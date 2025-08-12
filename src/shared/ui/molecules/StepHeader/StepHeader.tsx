import React from "react";
import { View, Text } from "react-native";
import { CheckCircleIcon } from "phosphor-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./StepHeader.styles";

interface StepHeaderProps {
  stepNumber: number;
  title: string;
  description: string;
  completed: boolean;
}

export const StepHeader: React.FC<StepHeaderProps> = ({
  stepNumber,
  title,
  description,
  completed,
}) => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);

  return (
    <View
      style={styles.stepHeader}
      accessibilityLabel={`${title}. ${
        completed ? "Completed" : "In progress"
      }`}
      accessibilityHint={description}
      accessibilityRole="summary"
    >
      <View style={styles.stepTitleRow}>
        <View
          style={styles.stepNumberContainer}
          accessibilityRole="image"
          accessibilityLabel={
            completed ? `Step ${stepNumber} completed` : `Step ${stepNumber}`
          }
        >
          {completed ? (
            <CheckCircleIcon
              size={24}
              color={colors.semantic.calories}
              weight="fill"
            />
          ) : (
            <View
              style={[styles.stepNumber, { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.stepNumberText, { color: colors.white }]}>
                {stepNumber}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.stepTitleContent}>
          <Text style={styles.stepTitle} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.stepDescription}>{description}</Text>
        </View>
      </View>
    </View>
  );
};
