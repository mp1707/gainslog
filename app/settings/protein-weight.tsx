import React, { useState, useMemo, useRef, useCallback } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { Card } from "@/components/Card";
import { Button } from "@/components/index";
import { useRouter } from "expo-router";
import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { GradientWrapper } from "@/components/shared/GradientWrapper";

const isValidWeight = (weight: number | undefined) =>
  weight !== undefined && weight >= 30 && weight <= 300;

const ProteinWeightSelectionScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { userSettings, setUserSettings } = useAppStore();
  const { safeNavigate, isNavigating } = useNavigationGuard();
  const { back } = useRouter();
  const [weight, setWeight] = useState<number | undefined>(
    userSettings?.weight
  );
  const inputRef = useRef<TextInput>(null);

  useDelayedAutofocus(inputRef);

  const handleCancel = () => {
    back();
  };

  const handleSave = () => {
    handleContinue();
  };

  const handleWeightChange = (weightText: string) => {
    const newWeight = Number(weightText);
    setWeight(newWeight);
  };

  const handleContinue = async () => {
    if (!userSettings) return;
    if (!weight) return;

    if (!isValidWeight(weight)) {
      Alert.alert(
        "Invalid Weight",
        "Please enter a weight between 30 and 300 kg.",
        [{ text: "OK" }]
      );
      return;
    }

    setUserSettings({ ...userSettings, weight });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate("/settings/protein-goals");
  };

  return (
    <GradientWrapper style={styles.container}>
      <ModalHeader 
        title="Weight"
        onClose={handleCancel}
        closeAccessibilityLabel="Go back"
        closeAccessibilityHint="Returns to previous screen without saving changes"
      />
      
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>What's your weight?</Text>
          <Text style={styles.description}>
            Your weight is needed to calculate personalized protein
            recommendations.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              value={weight ? weight.toString() : ""}
              onChangeText={handleWeightChange}
              placeholder="70"
              keyboardType="numeric"
              keyboardAppearance={colorScheme}
              style={styles.weightInput}
              selectTextOnFocus
            />
            <Text style={styles.unitText}>kg</Text>
          </View>
        </View>

        <View style={styles.spacer} />
      </View>

      <KeyboardStickyView offset={{ closed: -30, opened: -10 }}>
        <Card style={styles.keyboardAccessory}>
          <Button
            variant="primary"
            onPress={handleContinue}
            iconPosition="right"
            disabled={!isValidWeight(weight)}
            icon={
              <ChevronRight
                size={20}
                color={
                  isValidWeight(weight) ? colors.black : colors.disabledText
                }
                strokeWidth={2.5}
              />
            }
          >
            Continue
          </Button>
        </Card>
      </KeyboardStickyView>
    </GradientWrapper>
  );
};

export default ProteinWeightSelectionScreen;

const createStyles = (colors: any, themeObj: any) => {
  const { spacing, typography } = themeObj;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBackground },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
      justifyContent: "flex-start",
      gap: spacing.xxl,
    },
    textSection: { paddingTop: spacing.lg, gap: spacing.sm },
    subtitle: {
      fontSize: typography.Title2.fontSize,
      fontFamily: typography.Title2.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
    },
    description: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
    },
    inputSection: { alignItems: "center" },
    inputContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "center",
    },
    unitText: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.secondaryText,
      marginLeft: spacing.sm,
    },
    spacer: { flex: 1, minHeight: 64 },
    weightInput: {
      fontSize: 48,
      fontFamily: typography.Title1.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      minWidth: 100,
      backgroundColor: "transparent",
    },
    keyboardAccessory: {
      padding: themeObj.spacing.sm,
      marginHorizontal: themeObj.spacing.md,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: themeObj.spacing.sm,
    },
  });
};
