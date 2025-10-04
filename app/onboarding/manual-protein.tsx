import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
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

const ManualProteinScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { safePush } = useNavigationGuard();
  const { calorieGoal, proteinGoal, setProteinGoal } = useOnboardingStore();

  // Initialize with store value if available
  const [protein, setProtein] = useState(proteinGoal?.toString() || "");

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
            Protein provides 4 kcal per gram.
          </AppText>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <View style={styles.labelSection}>
              <BicepsFlexed size={20} color={colors.semantic.protein} fill={colors.semantic.protein} strokeWidth={0} />
              <AppText role="Body" color="secondary">Daily Protein</AppText>
            </View>

            <View style={styles.inputValueSection}>
              <TextInput
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                placeholder="150"
                fontSize="Headline"
                style={styles.input}
              />
              <AppText role="Body" color="secondary">
                g
              </AppText>
            </View>
          </View>

          {/* Show calorie calculation inline */}
          {protein && parseInt(protein, 10) > 0 && (
            <View style={styles.calorieInfo}>
              <AppText role="Caption" color="secondary">
                {proteinCalories} kcal from protein
              </AppText>
            </View>
          )}
        </View>
      </View>
    </OnboardingScreen>
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
