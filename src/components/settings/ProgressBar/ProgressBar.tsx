import React from "react";
import { View } from "react-native";
import { useTheme } from "@/providers";
import { createStyles } from "./ProgressBar.styles";

export interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
  accessibilityLabel?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  totalSteps,
  currentStep,
  accessibilityLabel,
}) => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);

  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View 
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || `Step ${currentStep} of ${totalSteps}`}
      accessibilityValue={{ 
        min: 1, 
        max: totalSteps, 
        now: currentStep 
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isConnected = index < steps.length - 1;

        return (
          <React.Fragment key={step}>
            <View
              style={[
                styles.step,
                isCompleted && styles.stepCompleted,
                isCurrent && styles.stepCurrent,
              ]}
            />
            {isConnected && (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};