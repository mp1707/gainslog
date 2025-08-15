import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/providers";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";

interface CalculatorScreenLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  progressLabel: string;
}

export function CalculatorScreenLayout({
  children,
  currentStep,
  totalSteps,
  progressLabel,
}: CalculatorScreenLayoutProps) {
  const { colors, theme: themeObj } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    progressContainer: {
      padding: themeObj.spacing.md,
    },
    content: {
      flex: 1,
      paddingHorizontal: themeObj.spacing.pageMargins.horizontal,
      justifyContent: "flex-start",
      alignItems: "stretch",
      gap: themeObj.spacing.xxl,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.progressContainer}>
        <ProgressBar
          totalSteps={totalSteps}
          currentStep={currentStep}
          accessibilityLabel={progressLabel}
        />
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}