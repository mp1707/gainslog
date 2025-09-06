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
import { StatusIcon } from "@/components/shared/StatusIcon";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { StyleSheet } from "react-native";
import { Card, AppText, Button } from "src/components";
import { ChevronRight } from "lucide-react-native";
import { AppearanceCard } from "@/components/settings/AppearanceCard";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { useRouter } from "expo-router";
import { seedFoodLogs } from "@/utils/seed";
import { CloseButton } from "@/components/shared/CloseButton";

export default function SettingsTab() {
  const isLoadingTargets = false;
  const { colors, theme: themeObj } = useTheme();
  const keyboardOffset = useKeyboardOffset(true);
  const { safeNavigate, isNavigating } = useNavigationGuard();
  const { dailyTargets, clearAllLogs } = useAppStore();
  const { back } = useRouter();

  const styles = useMemo(
    () => createStyles(colors, themeObj, keyboardOffset),
    [colors, themeObj, keyboardOffset]
  );

  const isCaloriesSet = dailyTargets?.calories;
  const isProteinSet = dailyTargets?.protein;
  const isFatSet = dailyTargets?.fat;

  const proteinEnabled = isCaloriesSet;
  const fatEnabled = isProteinSet;
  const carbsEnabled = isFatSet;

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
        <ModalHeader onClose={handleClose} />
        <AppText role="Body" color="secondary">
          Loading settings...
        </AppText>
      </View>
    );
  }

  // Determine next step for guidance icon
  const nextStep = !isCaloriesSet
    ? "calories"
    : !isProteinSet
    ? "protein"
    : null;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* <ModalHeader title="Settings" onClose={handleClose} /> */}
        <View style={styles.closeButton}>
          <CloseButton
            onPress={handleClose}
            accessibilityLabel={"Go back"}
            accessibilityHint={"Returns to previous screen"}
          />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SettingsSection
            title="Appearance"
            subtitle="Customize the visual appearance of your app"
          >
            <AppearanceCard />
          </SettingsSection>

          <SettingsSection
            title="Nutrition Tracking"
            subtitle="Set up your daily targets"
          >
            <Card>
              {/* Calories Setting Card */}
              <TouchableOpacity
                style={styles.firstSettingsRow}
                onPress={() =>
                  isCaloriesSet
                    ? safeNavigate("/settings/calorie-editCalories")
                    : safeNavigate("/settings/calorie-sex")
                }
                disabled={isNavigating}
                accessibilityRole="button"
                accessibilityLabel="Calories setting"
                accessibilityHint={
                  isCaloriesSet
                    ? "Configure your daily calorie target"
                    : "Set your daily calorie target"
                }
              >
                <View style={styles.settingInfo}>
                  <AppText role="Headline" style={{ marginBottom: 4 }}>
                    Calories
                  </AppText>
                  <AppText role="Caption" color="secondary">
                    {isCaloriesSet
                      ? `Target: ${dailyTargets.calories} kcal`
                      : "Set target"}
                  </AppText>
                </View>
                <View style={styles.settingAccessory}>
                  <StatusIcon
                    type={isCaloriesSet ? "completed" : "next"}
                    accessibilityLabel={
                      isCaloriesSet
                        ? "Calorie target completed"
                        : "Next step: set calories"
                    }
                  />
                  <ChevronRight
                    size={16}
                    color={colors.secondaryText}
                    style={{ marginLeft: 8 }}
                    strokeWidth={1.5}
                  />
                </View>
              </TouchableOpacity>

              {/* Protein Setting Card */}
              <TouchableOpacity
                style={[
                  styles.settingsRow,
                  styles.settingCardWithBorder,
                  { opacity: proteinEnabled ? 1 : 0.5 },
                ]}
                onPress={() =>
                  isProteinSet
                    ? safeNavigate("/settings/protein-editProtein")
                    : safeNavigate("/settings/protein-weight")
                }
                disabled={!proteinEnabled || isNavigating}
                accessibilityRole="button"
                accessibilityLabel="Protein setting"
                accessibilityHint={
                  proteinEnabled
                    ? isProteinSet
                      ? "Configure your daily protein target"
                      : "Set your daily protein target"
                    : "Set calories first to enable protein setting"
                }
              >
                <View style={styles.settingInfo}>
                  <AppText role="Headline" style={{ marginBottom: 4 }}>
                    Protein
                  </AppText>
                  <AppText role="Caption" color="secondary">
                    {proteinEnabled
                      ? isProteinSet
                        ? `Target: ${dailyTargets.protein} g`
                        : "Set target"
                      : "Set calories first"}
                  </AppText>
                </View>
                <View style={styles.settingAccessory}>
                  {isProteinSet ? (
                    <StatusIcon
                      type="completed"
                      accessibilityLabel="Protein target completed"
                    />
                  ) : nextStep === "protein" ? (
                    <StatusIcon
                      type="next"
                      accessibilityLabel="Next step: set protein"
                    />
                  ) : null}
                  <ChevronRight
                    size={16}
                    color={colors.secondaryText}
                    style={{ marginLeft: 8 }}
                    strokeWidth={1.5}
                  />
                </View>
              </TouchableOpacity>

              {/* Fat Setting Card */}
              <TouchableOpacity
                style={[
                  styles.settingsRow,
                  styles.settingCardWithBorder,
                  { opacity: fatEnabled ? 1 : 0.5 },
                ]}
                onPress={() => safeNavigate("/settings/fat-editFat")}
                disabled={!fatEnabled || isNavigating}
                accessibilityRole="button"
                accessibilityLabel="Fat setting"
                accessibilityHint={
                  fatEnabled
                    ? "Configure your daily fat target"
                    : "Set protein first to enable fat setting"
                }
              >
                <View style={styles.settingInfo}>
                  <AppText role="Headline" style={{ marginBottom: 4 }}>
                    Fat
                  </AppText>
                  <AppText role="Caption" color="secondary">
                    {fatEnabled
                      ? `Target: ${dailyTargets.fat} g`
                      : "Set protein first"}
                  </AppText>
                </View>
                <View style={styles.settingAccessory}>
                  {fatEnabled && (
                    <StatusIcon
                      type="completed"
                      accessibilityLabel="Fat target ready"
                    />
                  )}
                  <ChevronRight
                    size={16}
                    color={colors.secondaryText}
                    style={{ marginLeft: 8 }}
                    strokeWidth={1.5}
                  />
                </View>
              </TouchableOpacity>

              {/* Carbs Setting Card */}
              <TouchableOpacity
                style={[
                  styles.lastSettingsRow,
                  styles.settingCardWithBorder,
                  { opacity: carbsEnabled ? 1 : 0.5 },
                ]}
                onPress={() => safeNavigate("/settings/carbs")}
                disabled={!carbsEnabled || isNavigating}
                accessibilityRole="button"
                accessibilityLabel="Carbs setting"
                accessibilityHint={
                  carbsEnabled
                    ? "View your daily carb target"
                    : "Set protein first to enable carb setting"
                }
              >
                <View style={styles.settingInfo}>
                  <AppText role="Headline" style={{ marginBottom: 4 }}>
                    Carbs
                  </AppText>
                  <AppText role="Caption" color="secondary">
                    {carbsEnabled
                      ? `Target: ${dailyTargets.carbs} g`
                      : "Set protein first"}
                  </AppText>
                </View>
                <View style={styles.settingAccessory}>
                  {carbsEnabled && (
                    <StatusIcon
                      type="completed"
                      accessibilityLabel="Carb target ready"
                    />
                  )}
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
                  onPress={handleSeedData}
                  variant="secondary"
                  size="medium"
                  accessibilityLabel="Seed test data"
                  accessibilityHint="Populates the app with test food logs for the last 120 days"
                  style={styles.seedButton}
                >
                  <AppText role="Button">Seed Test Data</AppText>
                </Button>
              </View>
              <View style={styles.seedButtonContainer}>
                <Button
                  onPress={handleClearAllLogs}
                  variant="destructive"
                  size="medium"
                  accessibilityLabel="Clear all food logs"
                  accessibilityHint="Removes all food logs from the app database"
                  style={styles.seedButton}
                >
                  <AppText role="Button" color="white">
                    Clear All Food Logs
                  </AppText>
                </Button>
              </View>
            </Card>
          </SettingsSection>
        </ScrollView>
      </View>
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
      top: spacing.lg,
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
      paddingTop: spacing.xxl + spacing.md, 
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
