import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import { Flame } from "lucide-react-native";
import { TextInput } from "@/components/shared/TextInput";
import { Button } from "@/components/shared/Button";
import { OnboardingScreen } from "../../src/components/onboarding/OnboardingScreen";
import { useOnboardingStore } from "@/store/useOnboardingStore";

const ManualCaloriesScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { safePush } = useNavigationGuard();
  const { calorieGoal, setCalorieGoal, setInputMethod } = useOnboardingStore();

  // Initialize with store value if available
  const [calories, setCalories] = useState(calorieGoal?.toString() || "");

  // Ensure we're in manual mode
  useEffect(() => {
    setInputMethod("manual");
  }, [setInputMethod]);

  const handleContinue = async () => {
    const caloriesNum = parseInt(calories, 10);
    setCalorieGoal(caloriesNum);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush("/onboarding/manual-protein");
  };

  // Validation - calories must be > 0
  const isValid = calories !== "" && parseInt(calories, 10) > 0;

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
          <AppText role="Title2">Set Your Calorie Target</AppText>
          <AppText role="Body" color="secondary" style={styles.subtitle}>
            How many calories will you eat per day?
          </AppText>
        </View>

        {/* Helper Info */}
        <View style={styles.helperSection}>
          <AppText role="Caption" color="secondary" style={styles.helperText}>
            Most athletes consume 2000-3500 kcal/day depending on goals.
          </AppText>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <View style={styles.labelSection}>
              <Flame size={20} color={colors.semantic.calories} fill={colors.semantic.calories} strokeWidth={0} />
              <AppText role="Body" color="secondary">Daily Calories</AppText>
            </View>

            <View style={styles.inputValueSection}>
              <TextInput
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
                placeholder="2000"
                fontSize="Headline"
                style={styles.input}
              />
              <AppText role="Body" color="secondary">
                kcal
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </OnboardingScreen>
  );
};

export default ManualCaloriesScreen;

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
  });
};
