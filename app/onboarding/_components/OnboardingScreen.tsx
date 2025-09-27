import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/theme";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

interface OnboardingScreenProps {
  children: React.ReactNode;
  actionButton?: React.ReactNode;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  children,
  actionButton,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <GradientWrapper style={styles.container}>
      <View style={styles.content}>
        <KeyboardAwareScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </KeyboardAwareScrollView>

        {actionButton && (
          <View style={styles.actionButtonContainer}>{actionButton}</View>
        )}
      </View>
    </GradientWrapper>
  );
};

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, theme: Theme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
      paddingTop: spacing.md,
    },
    content: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingVertical: spacing.xl,
    },
    actionButtonContainer: {
      position: "absolute",
      bottom: spacing.lg,
      left: spacing.pageMargins.horizontal,
      right: spacing.pageMargins.horizontal,
    },
  });
};
