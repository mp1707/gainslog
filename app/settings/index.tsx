import React, { useMemo } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { StyleSheet } from "react-native";
import { Card, AppText, Button } from "src/components";
import { ChevronRight } from "lucide-react-native";
import { AppearanceCard } from "@/components/settings/AppearanceCard";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { useRouter } from "expo-router";
import { seedFoodLogs } from "@/utils/seed";
import { RoundButton } from "@/components/shared/RoundButton";
import { X } from "lucide-react-native";
import { GradientWrapper } from "@/components/shared/GradientWrapper";

export default function SettingsTab() {
  const isLoadingTargets = false;
  const { colors, theme: themeObj } = useTheme();
  const keyboardOffset = useKeyboardOffset(true);
  const { safeNavigate, isNavigating } = useNavigationGuard();
  const { clearAllLogs } = useAppStore();
  const { back } = useRouter();

  const styles = useMemo(
    () => createStyles(colors, themeObj, keyboardOffset),
    [colors, themeObj, keyboardOffset]
  );

  // Nutrition calculators moved under /Goals; provide a single entry link

  const handleClose = () => {
    back();
  };

  const handleSeedData = () => {
    seedFoodLogs();
  };

  const handleClearAllLogs = () => {
    Alert.alert(
      "Clear All Food Logs",
      "Are you sure you want to delete all food logs? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => clearAllLogs(),
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoadingTargets) {
    return (
      <View style={[styles.container, styles.centered]}>
        <AppText role="Body" color="secondary">
          Loading settings...
        </AppText>
      </View>
    );
  }

  // No per-macro guidance here; entry point links to Goals flow

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <GradientWrapper style={styles.container}>
        <View style={styles.closeButton}>
          <RoundButton
            onPress={handleClose}
            Icon={X}
            variant="tertiary"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to previous screen"
          />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SettingsSection
            title="Pro"
            subtitle="Get Pro and start your journey today!"
          >
            <Button label="Get MacroLoop Pro" variant="primary" />
          </SettingsSection>
          <SettingsSection
            title="Appearance"
            subtitle="Customize the visual appearance of your app"
          >
            <AppearanceCard />
          </SettingsSection>
          <SettingsSection
            title="Nutrition Goals"
            subtitle="Open the Goals flow to set daily targets"
          >
            <Card>
              <TouchableOpacity
                style={styles.firstSettingsRow}
                onPress={() => safeNavigate("/Goals")}
                disabled={isNavigating}
                accessibilityRole="button"
                accessibilityLabel="Open goals"
                accessibilityHint="Opens the goals calculator flow"
              >
                <View style={styles.settingInfo}>
                  <AppText role="Headline" style={{ marginBottom: 4 }}>
                    Set Your Goals
                  </AppText>
                  <AppText role="Caption" color="secondary">
                    Calories, protein, fat and carbs
                  </AppText>
                </View>
                <View style={styles.settingAccessory}>
                  <ChevronRight
                    size={16}
                    color={colors.secondaryText}
                    style={{ marginLeft: 8 }}
                    strokeWidth={1.5}
                  />
                </View>
              </TouchableOpacity>
            </Card>
          </SettingsSection>
          <SettingsSection
            title="Development Tools"
            subtitle="Tools for testing and development"
          >
            <Card>
              <View style={styles.seedButtonContainer}>
                <Button
                  label="Seed Test Data"
                  variant="secondary"
                  onPress={handleSeedData}
                  style={styles.seedButton}
                />
              </View>
              <View style={styles.seedButtonContainer}>
                <Button
                  label="Clear All Food Logs"
                  variant="secondary"
                  onPress={handleClearAllLogs}
                  style={styles.seedButton}
                />
              </View>
            </Card>
          </SettingsSection>
        </ScrollView>
      </GradientWrapper>
    </KeyboardAvoidingView>
  );
}

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (
  colors: Colors,
  themeObj: Theme,
  bottomPadding?: number
) => {
  const { spacing } = themeObj;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    closeButton: {
      position: "absolute",
      top: spacing.md,
      right: spacing.md,
      zIndex: 15,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: themeObj.spacing.pageMargins.horizontal,
      paddingTop: spacing.xxl,
      paddingBottom: bottomPadding || spacing.xl,
    },
    resetButtonContainer: {
      marginTop: spacing.lg,
      alignItems: "center",
    },
    resetButton: {
      minWidth: 200,
    },
    seedButtonContainer: {
      paddingVertical: spacing.md,
      alignItems: "center",
    },
    seedButton: {
      minWidth: 200,
    },
    settingCard: {
      // paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "transparent",
    },
    firstSettingsRow: {
      paddingBottom: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "transparent",
    },
    settingsRow: {
      paddingVertical: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "transparent",
    },
    lastSettingsRow: {
      paddingTop: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "transparent",
    },

    settingCardWithBorder: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.lg,
    },
    settingAccessory: {
      flexDirection: "row",
      alignItems: "center",
    },
  });
};
