import React, { useState, useRef, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Platform,
  StyleSheet,
  Alert,
  InteractionManager,
} from "react-native";
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

const inputAccessoryViewID = "weight-input-accessory";

const isValidWeight = (weight: number | undefined) =>
  weight !== undefined && weight >= 30 && weight <= 300;

const WeightSelectionScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { userSettings, setUserSettings } = useAppStore();
  const { safeNavigate, isNavigating } = useNavigationGuard();
  const [weight, setWeight] = useState<number | undefined>(
    userSettings?.weight
  );
  const inputRef = useRef<TextInput>(null);
  const { back } = useRouter();
  const router = useRouter();

  useDelayedAutofocus(inputRef);

  const handleCancel = () => {
    router.dismissTo("/");
  };

  const handleBack = () => {
    back();
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
    safeNavigate("/settings/calorie-height");
  };

  return (
    <GradientWrapper style={styles.container}>
      <ModalHeader handleBack={handleBack} handleCancel={handleCancel} />
      
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>What’s your weight?</Text>
          <Text style={styles.description}>
            Your weight is important for calculating your calorie needs.
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
              inputAccessoryViewID={inputAccessoryViewID}
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

export default WeightSelectionScreen;

const createStyles = (colors: any, themeObj: any) => {
  const { spacing, typography, components } = themeObj;
  return StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.primaryBackground,
      gap: themeObj.spacing.md
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
      justifyContent: "flex-start",
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
    continueButton: {
      backgroundColor: colors.accent,
      borderRadius: components.buttons.cornerRadius,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
      marginHorizontal: spacing.pageMargins.horizontal,
      marginBottom: spacing.lg,
    },
    continueButtonText: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.black,
      fontWeight: "600",
      marginRight: spacing.sm,
    },
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
