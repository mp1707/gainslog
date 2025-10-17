import React from "react";
import { View, StyleSheet } from "react-native";
import { IOSButton } from "@/components/shared/IOSButton";
import { useTheme } from "@/theme";
import { ProgressBar } from "./ProgressBar";

interface OnboardingHeaderProps {
  onBack: () => void;
  onSkip: () => void;
  currentStep?: number;
  totalSteps?: number;
  showProgressBar?: boolean;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  onBack,
  onSkip,
  currentStep = 0,
  totalSteps = 7,
  showProgressBar = false,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <View style={styles.container}>
      {/* Navigation buttons */}
      <View style={styles.navigationContainer}>
        <View style={styles.backButton}>
          <IOSButton
            variant="glass"
            systemIcon="chevron.left"
            iconColor={colors.primaryText}
            onPress={onBack}
            accessibilityLabel="Go back"
            accessibilityHint="Navigate to previous step"
          />
        </View>
        <View style={styles.skipButton}>
          <IOSButton
            variant="glass"
            systemIcon="xmark"
            iconColor={colors.primaryText}
            onPress={onSkip}
            accessibilityLabel="Skip onboarding"
            accessibilityHint="Skip the onboarding process"
          />
        </View>
      </View>

      {/* Progress bar */}
      {showProgressBar && (
        <View style={styles.progressBarContainer}>
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </View>
      )}
    </View>
  );
};

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, theme: Theme) => {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.primaryBackground,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    navigationContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.md,
      height: 48,
    },
    backButton: {
      // Navigation buttons are positioned within this container
    },
    skipButton: {
      // Navigation buttons are positioned within this container
    },
    progressBarContainer: {
      marginTop: theme.spacing.md,
    },
  });
};
