import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme";
import { GradientWrapper } from "@/components/shared/GradientWrapper";

interface OnboardingScreenProps {
  children: React.ReactNode;
  actionButton?: React.ReactNode;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  children,
  actionButton,
}) => {
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, theme, insets.bottom);

  return (
    <GradientWrapper style={styles.container}>
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {actionButton && (
          <View style={styles.actionButtonContainer}>{actionButton}</View>
        )}
      </View>
    </GradientWrapper>
  );
};

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, theme: Theme, bottomInset: number) => {
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
      minHeight: "100%",
    },
    actionButtonContainer: {
      position: "absolute",
      bottom: Math.max(bottomInset, spacing.lg),
      left: spacing.pageMargins.horizontal,
      right: spacing.pageMargins.horizontal,
    },
  });
};
