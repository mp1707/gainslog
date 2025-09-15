import React, { useState, useRef } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors, Theme, useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useAppStore } from "@/store/useAppStore";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { Card } from "@/components/Card";
import { Button } from "@/components/index";
import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { useRouter } from "expo-router";
import { GradientWrapper } from "@/components/shared/GradientWrapper";

const inputAccessoryViewID = "age-input-accessory";

const isValidAge = (age: number | undefined) =>
  age !== undefined && age >= 15 && age <= 100;

const AgeSelectionScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { userSettings, setUserSettings } = useAppStore();
  const { safeNavigate } = useNavigationGuard();
  const { back } = useRouter();
  const router = useRouter();
  const [age, setAge] = useState<number | undefined>(userSettings?.age);
  const inputRef = useRef<TextInput>(null);

  useDelayedAutofocus(inputRef);

  const handleContinue = async () => {
    if (!isValidAge(age)) return;
    if (!age) return;
    if (!userSettings) return;
    setUserSettings({ ...userSettings, age: age });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate("/Goals/calorie-weight");
  };

  const handleAgeChange = (age: string) => {
    const newAge = Number(age);
    setAge(newAge);
  };

  const handleCancel = () => {
    router.dismissTo("/");
  };

  const handleBack = () => {
    back();
  };

  return (
    <GradientWrapper style={styles.container}>
      <ModalHeader handleBack={handleBack} handleCancel={handleCancel} />

      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>How old are you?</Text>
          <Text style={styles.description}>
            Your age helps us calculate your calorie needs.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            ref={inputRef}
            value={age ? age.toString() : ""}
            onChangeText={handleAgeChange}
            placeholder="30"
            keyboardType="numeric"
            keyboardAppearance={colorScheme}
            style={styles.ageInput}
            accessibilityLabel="Age input"
            inputAccessoryViewID={inputAccessoryViewID}
            selectTextOnFocus
          />
        </View>
        <View style={styles.spacer} />
      </View>

      <KeyboardStickyView offset={{ closed: -30, opened: -10 }}>
        <View style={styles.keyboardAccessory}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Button
              variant="primary"
              label="Continue"
              Icon={ChevronRight}
              iconPlacement="right"
              onPress={handleContinue}
              disabled={!isValidAge(age)}
            />
          </View>
        </View>
      </KeyboardStickyView>
    </GradientWrapper>
  );
};

export default AgeSelectionScreen;

const createStyles = (colors: Colors, theme: Theme) => {
  const { spacing, typography, components } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
      gap: theme.spacing.md,
    },
    progressContainer: { padding: spacing.md },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
      gap: spacing.xxl,
    },
    textSection: { gap: spacing.sm },
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
    },
    inputSection: { alignItems: "center" },
    ageInput: {
      fontSize: 48,
      fontFamily: typography.Title1.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      minWidth: 100,
    },
    spacer: { flex: 1 },
    continueButton: {
      backgroundColor: colors.accent,
      borderRadius: components.buttons.cornerRadius,
      paddingVertical: spacing.md,
      flexDirection: "row",
      justifyContent: "center",
      marginHorizontal: spacing.pageMargins.horizontal,
      marginBottom: spacing.lg,
    },
    continueButtonText: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.black,
      marginRight: spacing.sm,
    },
    keyboardAccessory: {
      marginHorizontal: theme.spacing.sm,
      backgroundColor: colors.secondaryBackground,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.spacing.sm,
      borderRadius: 9999,
      padding: theme.spacing.sm,
      overflow: "hidden",
      zIndex: 99,
    },
  });
};
