import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TextInput as RNTextInput } from "react-native";
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
import { KeyboardStickyView } from "react-native-keyboard-controller";

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
  const inputRef = useRef<RNTextInput>(null);

  // Initialize with store value if available
  const [fat, setFat] = useState(fatGoal?.toString() || "");

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

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
    <>
      <OnboardingScreen>
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
              Fat provides 9 kcal per gram. {fat && parseInt(fat, 10) > 0 && `${fatCalories} kcal from fat.`}
            </AppText>
          </View>
        </View>
      </OnboardingScreen>

      {/* Sticky Input + Button */}
      <KeyboardStickyView offset={{ closed: 0, opened: 0 }} style={styles.stickyContainer}>
        <View style={styles.stickyContent}>
          <View style={styles.inputContainer}>
            <Droplet size={20} color={colors.semantic.fat} fill={colors.semantic.fat} strokeWidth={0} />
            <TextInput
              ref={inputRef}
              value={fat}
              onChangeText={setFat}
              keyboardType="numeric"
              placeholder="65"
              fontSize="Headline"
              containerStyle={{ backgroundColor: colors.subtleBackground }}
              style={styles.input}
            />
            <AppText role="Body" color="secondary">g</AppText>
          </View>
          <Button
            variant="primary"
            label="Continue"
            onPress={handleContinue}
            disabled={!isValid}
            style={styles.continueButton}
          />
        </View>
      </KeyboardStickyView>
    </>
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
      gap: spacing.xl,
      flex: 1,
      justifyContent: "center",
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
      lineHeight: 22,
    },
    stickyContainer: {
      backgroundColor: colors.primaryBackground,
      borderTopWidth: 1,
      borderTopColor: colors.subtleBackground,
      paddingBottom: spacing.md,
    },
    stickyContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
    inputContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    input: {
      flex: 1,
      textAlign: "center",
    },
    continueButton: {
      minWidth: 100,
    },
  });
};
