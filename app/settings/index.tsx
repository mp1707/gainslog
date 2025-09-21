import React, { useMemo } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { Card, AppText, Button } from "src/components";
import { ChevronRight, X } from "lucide-react-native";
import { AppearanceCard } from "@/components/settings/AppearanceCard";
import { useRouter } from "expo-router";
import { seedFoodLogs } from "@/utils/seed";
import { RoundButton } from "@/components/shared/RoundButton";
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
          <View style={styles.header}>
            <AppText role="Title1" style={styles.headerTitle}>
              Settings
            </AppText>
            {/* <AppText role="Body" color="secondary">
              Tailor MacroLoop to match your workflow.
            </AppText> */}
          </View>

          <Card style={styles.proCard}>
            <AppText role="Caption" color="accent" style={styles.proBadge}>
              MacroLoop Pro
            </AppText>
            <AppText role="Headline" style={styles.cardTitle}>
              Unlock richer insights
            </AppText>
            <AppText
              role="Body"
              color="secondary"
              style={styles.cardDescription}
            >
              Detailed nutrient guidance, unlimited logs, and priority updates
              for your routine.
            </AppText>
            <Button label="Get MacroLoop Pro" variant="primary" />
          </Card>

          <View style={styles.section}>
            <AppText
              role="Caption"
              color="secondary"
              style={styles.sectionLabel}
            >
              Personalization
            </AppText>
            <AppearanceCard />
          </View>

          <View style={styles.section}>
            <AppText
              role="Caption"
              color="secondary"
              style={styles.sectionLabel}
            >
              Goals
            </AppText>
            <Card>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => safeNavigate("/Goals")}
                disabled={isNavigating}
                accessibilityRole="button"
                accessibilityLabel="Open goals"
                accessibilityHint="Opens the goals calculator flow"
              >
                <View style={styles.settingInfo}>
                  <AppText role="Headline" style={styles.settingTitle}>
                    Nutrition targets
                  </AppText>
                  <AppText role="Body" color="secondary">
                    Adjust your daily calorie and macro goals.
                  </AppText>
                </View>
                <ChevronRight
                  size={18}
                  color={colors.secondaryText}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
            </Card>
          </View>

          <View style={styles.section}>
            <AppText
              role="Caption"
              color="secondary"
              style={styles.sectionLabel}
            >
              Developer
            </AppText>
            <Card>
              <View style={styles.cardHeader}>
                <AppText role="Headline" style={styles.settingTitle}>
                  Developer toolkit
                </AppText>
                <AppText role="Body" color="secondary">
                  Quick utilities for testing flows during development.
                </AppText>
              </View>
              <View style={styles.buttonStack}>
                <Button
                  label="Seed sample logs"
                  variant="secondary"
                  onPress={handleSeedData}
                  style={styles.fullWidthButton}
                />
                <Button
                  label="Clear all food logs"
                  variant="tertiary"
                  onPress={handleClearAllLogs}
                  style={[styles.fullWidthButton, styles.buttonSpacing]}
                />
              </View>
            </Card>
          </View>
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
    header: {
      marginBottom: spacing.xl,
    },
    headerTitle: {
      marginBottom: spacing.xs,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionLabel: {
      marginBottom: spacing.sm,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    proCard: {
      marginBottom: spacing.xl,
    },
    proBadge: {
      marginBottom: spacing.xs,
    },
    cardTitle: {
      marginBottom: spacing.xs,
    },
    cardDescription: {
      marginBottom: spacing.lg,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.md,
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.lg,
    },
    settingTitle: {
      marginBottom: spacing.xs,
    },
    cardHeader: {
      marginBottom: spacing.lg,
    },
    buttonStack: {
      marginTop: spacing.md,
    },
    fullWidthButton: {
      width: "100%",
    },
    buttonSpacing: {
      marginTop: spacing.sm,
    },
  });
};
