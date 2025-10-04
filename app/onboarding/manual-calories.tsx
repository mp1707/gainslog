import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TextInput as RNTextInput } from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import { Flame } from "lucide-react-native";
import { TextInput } from "@/components/shared/TextInput";
import { Button } from "@/components/shared/Button";
import { OnboardingScreen } from "../../src/components/onboarding/OnboardingScreen";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { KeyboardStickyView } from "react-native-keyboard-controller";

const ManualCaloriesScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { safePush } = useNavigationGuard();
  const { calorieGoal, setCalorieGoal, setInputMethod } = useOnboardingStore();
  const inputRef = useRef<RNTextInput>(null);

  // Initialize with store value if available
  const [calories, setCalories] = useState(calorieGoal?.toString() || "");

  // Ensure we're in manual mode
  useEffect(() => {
    setInputMethod("manual");
  }, [setInputMethod]);

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    const caloriesNum = parseInt(calories, 10);
    setCalorieGoal(caloriesNum);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush("/onboarding/manual-protein");
  };

  // Validation - calories must be > 0
  const isValid = calories !== "" && parseInt(calories, 10) > 0;

  return (
    <>
      <OnboardingScreen>
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
            <AppText role="Body" color="secondary" style={styles.helperText}>
              Most athletes consume 2000-3500 kcal/day depending on their goals and activity level.
            </AppText>
            <AppText role="Body" color="secondary" style={styles.helperText}>
              Consider your current weight, target weight, and daily activity when setting your calorie target.
            </AppText>
          </View>
        </View>
      </OnboardingScreen>

      {/* Sticky Input + Button */}
      <KeyboardStickyView offset={{ closed: 0, opened: 0 }} style={styles.stickyContainer}>
        <View style={styles.stickyContent}>
          <View style={styles.inputContainer}>
            <Flame size={20} color={colors.semantic.calories} fill={colors.semantic.calories} strokeWidth={0} />
            <TextInput
              ref={inputRef}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholder="2000"
              fontSize="Headline"
              containerStyle={{ backgroundColor: colors.subtleBackground }}
              style={styles.input}
            />
            <AppText role="Body" color="secondary">kcal</AppText>
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

export default ManualCaloriesScreen;

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
    helperSection: {
      paddingHorizontal: spacing.md,
      gap: spacing.md,
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
