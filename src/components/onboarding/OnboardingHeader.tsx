import React from "react";
import { View, StyleSheet } from "react-native";
import { ChevronLeft, X } from "lucide-react-native";
import { RoundButton } from "@/components/shared/RoundButton";
import { useTheme } from "@/theme";
import { ProgressBar } from "./ProgressBar";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Navigation buttons */}
      <View style={styles.navigationContainer}>
        <View style={styles.backButton}>
          <RoundButton
            onPress={onBack}
            Icon={ChevronLeft}
            variant="tertiary"
            accessibilityLabel={t("onboarding.header.backLabel")}
            accessibilityHint={t("onboarding.header.backHint")}
          />
        </View>
        <View style={styles.skipButton}>
          <RoundButton
            onPress={onSkip}
            Icon={X}
            variant="tertiary"
            accessibilityLabel={t("onboarding.header.skipLabel")}
            accessibilityHint={t("onboarding.header.skipHint")}
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
