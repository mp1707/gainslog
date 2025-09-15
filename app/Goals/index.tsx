import React, { useMemo } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { StatusIcon } from "@/components/shared/StatusIcon";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { Card, AppText } from "src/components";
import { ChevronRight, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { RoundButton } from "@/components/shared/RoundButton";
import { GradientWrapper } from "@/components/shared/GradientWrapper";

export default function GoalsScreen() {
  const { colors, theme: themeObj } = useTheme();
  const { dailyTargets } = useAppStore();
  const { safeNavigate, isNavigating } = useNavigationGuard();
  const { back } = useRouter();

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const isCaloriesSet = !!dailyTargets?.calories;
  const isProteinSet = !!dailyTargets?.protein;
  const isFatSet = !!dailyTargets?.fat;

  const proteinEnabled = isCaloriesSet;
  const fatEnabled = isProteinSet;
  const carbsEnabled = isFatSet;

  const handleClose = () => back();

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <GradientWrapper style={styles.container}>
        <View style={styles.header}>
          <AppText role="Title2">Set your goals!</AppText>
          <RoundButton
            onPress={handleClose}
            Icon={X}
            variant="tertiary"
            accessibilityLabel="Close"
            accessibilityHint="Close goals"
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card>
            {/* Calories Setting Card */}
            <TouchableOpacity
              style={styles.firstSettingsRow}
              onPress={() =>
                isCaloriesSet
                  ? safeNavigate("/Goals/calorie-editCalories")
                  : safeNavigate("/Goals/calorie-sex")
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
                    ? `Target: ${dailyTargets!.calories} kcal`
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
                  ? safeNavigate("/Goals/protein-editProtein")
                  : safeNavigate("/Goals/protein-weight")
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
                      ? `Target: ${dailyTargets!.protein} g`
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
                ) : isCaloriesSet ? (
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
              onPress={() => safeNavigate("/Goals/fat-editFat")}
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
                    ? `Target: ${dailyTargets!.fat} g`
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
              onPress={() => safeNavigate("/Goals/carbs")}
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
                    ? `Target: ${dailyTargets!.carbs} g`
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
        </ScrollView>
      </GradientWrapper>
    </KeyboardAvoidingView>
  );
}

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, theme: Theme) => {
  const { spacing } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
      gap: theme.spacing.md,
    },
    header: {
      padding: theme.spacing.md,
      paddingLeft: theme.spacing.lg,
      gap: theme.spacing.md,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    scrollView: { flex: 1 },
    scrollContent: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingBottom: spacing.xl,
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
    firstSettingsRow: {
      paddingBottom: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "transparent",
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.lg,
    },
    settingAccessory: {
      flexDirection: "row",
      alignItems: "center",
    },
    settingCardWithBorder: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
};
