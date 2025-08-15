import React from "react";
import { View, TouchableOpacity } from "react-native";
import { CaretLeftIcon } from "phosphor-react-native";
import { useTheme } from "@/providers";
import { ProgressBar } from "../ProgressBar";
import { createStyles } from "./CalculatorHeader.styles";

interface CalculatorHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}

export const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({
  currentStep,
  totalSteps,
  onBack,
}) => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.spacer} />
        <TouchableOpacity
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
        >
          <CaretLeftIcon size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressContainer}>
        <ProgressBar
          totalSteps={totalSteps}
          currentStep={currentStep}
          accessibilityLabel={`Calculator progress: step ${currentStep} of ${totalSteps}`}
        />
      </View>
    </View>
  );
};