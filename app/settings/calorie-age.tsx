import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
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
  const [age, setAge] = useState<number | undefined>(userSettings?.age);
  const inputRef = useRef<TextInput>(null);

  useDelayedAutofocus(inputRef);

  const handleContinue = async () => {
    if (!isValidAge(age)) return;
    if (!age) return;
    if (!userSettings) return;
    setUserSettings({ ...userSettings, age: age });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate("/settings/calorie-weight");
  };

  const handleAgeChange = (age: string) => {
    const newAge = Number(age);
    setAge(newAge);
  };

  const handleCancel = () => {
    back();
  };

  const handleSave = () => {
    if (isValidAge(age)) {
      handleContinue();
    }
  };

  return (
    <GradientWrapper style={styles.container}>
      <ModalHeader 
        title="Age"
        onClose={handleCancel}
        closeAccessibilityLabel="Go back"
        closeAccessibilityHint="Returns to previous screen without saving changes"
      />

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
        <Card style={styles.keyboardAccessory}>
          <Button
            variant="primary"
            onPress={handleContinue}
            iconPosition="right"
            disabled={!isValidAge(age)}
            icon={
              <ChevronRight
                size={20}
                color={isValidAge(age) ? colors.black : colors.disabledText}
                strokeWidth={1.5}
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

export default AgeSelectionScreen;

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing, typography, components } = themeObj;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBackground },
    progressContainer: { padding: spacing.md },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
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
      padding: themeObj.spacing.sm,
      marginHorizontal: themeObj.spacing.md,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: themeObj.spacing.sm,
    },
  });
};
