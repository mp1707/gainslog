import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TextInput as RNTextInput } from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import { BicepsFlexed } from "lucide-react-native";
import { TextInput } from "@/components/shared/TextInput";
import { Button } from "@/components/shared/Button";
import { OnboardingScreen } from "../../src/components/onboarding/OnboardingScreen";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { CalorieBreakdown } from "@/components/onboarding/CalorieBreakdown";
import { KeyboardStickyView } from "react-native-keyboard-controller";

const ManualProteinScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { safePush } = useNavigationGuard();
  const { calorieGoal, proteinGoal, setProteinGoal } = useOnboardingStore();
  const inputRef = useRef<RNTextInput>(null);

  // Initialize with store value if available
  const [protein, setProtein] = useState(proteinGoal?.toString() || "");

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    const proteinNum = parseInt(protein, 10);
    setProteinGoal(proteinNum);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush("/onboarding/manual-fat");
  };

  // Validation - protein calories must not exceed total calories
  const proteinCalories = parseInt(protein || "0", 10) * 4;
  const isValid =
    protein !== "" &&
    parseInt(protein, 10) > 0 &&
    calorieGoal !== undefined &&
    proteinCalories <= calorieGoal;

  return (
    <>
      <OnboardingScreen>
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.headerSection}>
            <AppText role="Title2">Set Your Protein Target</AppText>
            <AppText role="Body" color="secondary" style={styles.subtitle}>
              How much protein will you eat per day?
            </AppText>
          </View>

          {/* Calorie breakdown - info section */}
          {calorieGoal && (
            <View style={styles.breakdownSection}>
              <CalorieBreakdown
                totalCalories={calorieGoal}
                proteinGrams={parseInt(protein || "0", 10)}
                highlightMacro="protein"
              />
            </View>
          )}

          {/* Helper Info */}
          <View style={styles.helperSection}>
            <AppText role="Caption" color="secondary" style={styles.helperText}>
              Protein provides 4 kcal per gram.{" "}
              {protein &&
                parseInt(protein, 10) > 0 &&
                `${proteinCalories} kcal from protein.`}
            </AppText>
          </View>
        </View>
      </OnboardingScreen>

      {/* Sticky Input + Button */}
      <KeyboardStickyView
        offset={{ closed: 0, opened: 0 }}
        style={styles.stickyContainer}
      >
        <View style={styles.stickyContent}>
          <View style={styles.inputContainer}>
            <BicepsFlexed
              size={20}
              color={colors.semantic.protein}
              fill={colors.semantic.protein}
              strokeWidth={0}
            />
            <TextInput
              ref={inputRef}
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              placeholder="150"
              fontSize="Headline"
              containerStyle={{ backgroundColor: colors.subtleBackground }}
              style={styles.input}
            />
            <AppText role="Body" color="secondary">
              g
            </AppText>
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

export default ManualProteinScreen;

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
