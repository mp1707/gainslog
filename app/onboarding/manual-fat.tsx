import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import { Droplet } from "lucide-react-native";
import { TextInput } from "@/components/shared/TextInput";
import { Button } from "@/components/shared/Button";
import { OnboardingScreen } from "../../src/components/onboarding/OnboardingScreen";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { CalorieBreakdown } from "@/components/onboarding/CalorieBreakdown";

const ManualFatScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { safePush } = useNavigationGuard();
  const {
    calorieGoal,
    proteinGoal,
    fatGoal,
    setFatGoal,
  } = useOnboardingStore();

  // Initialize with store value if available
  const [fat, setFat] = useState(fatGoal?.toString() || "");

  const handleContinue = async () => {
    const fatNum = parseInt(fat, 10);
    setFatGoal(fatNum);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush("/onboarding/manual-summary");
  };

  // Validation - protein + fat calories must not exceed total calories
  const proteinCalories = (proteinGoal || 0) * 4;
  const fatCalories = parseInt(fat || "0", 10) * 9;
  const usedCalories = proteinCalories + fatCalories;
  const isValid =
    fat !== "" &&
    parseInt(fat, 10) > 0 &&
    calorieGoal !== undefined &&
    usedCalories <= calorieGoal;

  return (
    <OnboardingScreen
      actionButton={
        <Button
          variant="primary"
          label="Continue"
          onPress={handleContinue}
          disabled={!isValid}
        />
      }
    >
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.headerSection}>
          <AppText role="Title2">Set Your Fat Target</AppText>
          <AppText role="Body" color="secondary" style={styles.subtitle}>
            How much fat will you eat per day?
          </AppText>
        </View>

        {/* Calorie breakdown - info section */}
        {calorieGoal && proteinGoal !== undefined && (
          <View style={styles.breakdownSection}>
            <CalorieBreakdown
              totalCalories={calorieGoal}
              proteinGrams={proteinGoal}
              fatGrams={parseInt(fat || "0", 10)}
              highlightMacro="fat"
            />
          </View>
        )}

        {/* Helper Info */}
        <View style={styles.helperSection}>
          <AppText role="Caption" color="secondary" style={styles.helperText}>
            Fat provides 9 kcal per gram.
          </AppText>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <View style={styles.labelSection}>
              <Droplet size={20} color={colors.semantic.fat} fill={colors.semantic.fat} strokeWidth={0} />
              <AppText role="Body" color="secondary">Daily Fat</AppText>
            </View>

            <View style={styles.inputValueSection}>
              <TextInput
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                placeholder="65"
                fontSize="Headline"
                style={styles.input}
              />
              <AppText role="Body" color="secondary">
                g
              </AppText>
            </View>
          </View>

          {/* Show calorie calculation inline */}
          {fat && parseInt(fat, 10) > 0 && (
            <View style={styles.calorieInfo}>
              <AppText role="Caption" color="secondary">
                {fatCalories} kcal from fat
              </AppText>
            </View>
          )}
        </View>
      </View>
    </OnboardingScreen>
  );
};

export default ManualFatScreen;

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing } = themeObj;

  return StyleSheet.create({
    contentWrapper: {
      paddingHorizontal: spacing.lg,
      gap: spacing.lg,
    },
    headerSection: {
      alignItems: "center",
      gap: spacing.xs,
    },
    subtitle: {
      textAlign: "center",
      maxWidth: "80%",
    },
    breakdownSection: {
      paddingHorizontal: spacing.md,
    },
    helperSection: {
      paddingHorizontal: spacing.md,
    },
    helperText: {
      textAlign: "center",
    },
    inputSection: {
      gap: spacing.sm,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.subtleBackground,
    },
    labelSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      flex: 1,
    },
    inputValueSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      minWidth: 120,
    },
    input: {
      flex: 1,
      textAlign: "right",
    },
    calorieInfo: {
      alignItems: "center",
    },
  });
};
