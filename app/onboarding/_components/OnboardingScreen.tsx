import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/theme";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

interface OnboardingScreenProps {
  children: React.ReactNode;
  actionButton?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  children,
  actionButton,
  title,
  subtitle,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <KeyboardAwareScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {(title || subtitle) && (
            <View style={styles.headerSection}>
              {title}
              {subtitle}
            </View>
          )}
          <View style={styles.centeredContent}>{children}</View>
          {actionButton}
        </KeyboardAwareScrollView>

        {actionButton && <View style={styles.actionButtonContainer}></View>}
      </View>
    </View>
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
    },
    content: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: spacing.lg,
      gap: spacing.lg,
    },
    headerSection: {
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.pageMargins.horizontal,
      alignItems: "center",
      gap: spacing.sm,
    },
    centeredContent: {
      flex: 1,
      justifyContent: "center",
    },
    actionButtonContainer: {
      position: "absolute",
      bottom: spacing.lg,
      left: 0,
      right: 0,
      paddingHorizontal: spacing.pageMargins.horizontal,
    },
  });
};
