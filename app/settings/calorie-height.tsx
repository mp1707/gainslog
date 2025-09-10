import React, { useState, useRef, useCallback } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { Button } from "@/components/index";
import { useRouter } from "expo-router";
import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { GradientWrapper } from "@/components/shared/GradientWrapper";

const isValidHeight = (height: number | undefined) =>
  height !== undefined && height >= 100 && height <= 250;

const HeightSelectionScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { userSettings, setUserSettings } = useAppStore();
  const { safeNavigate, isNavigating } = useNavigationGuard();
  const [height, setHeight] = useState<number | undefined>(
    userSettings?.height
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

  const handleHeightChange = (heightText: string) => {
    const newHeight = Number(heightText);
    setHeight(newHeight);
  };

  const handleContinue = async () => {
    if (!userSettings) return;
    if (!height) return;

    if (!isValidHeight(height)) {
      Alert.alert(
        "Invalid Height",
        "Please enter a height between 100 and 250 cm.",
        [{ text: "OK" }]
      );
      return;
    }

    setUserSettings({ ...userSettings, height });

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate("/settings/calorie-activitylevel");
  };

  return (
    <GradientWrapper style={styles.container}>
      <ModalHeader handleBack={handleBack} handleCancel={handleCancel} />
      
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>How tall are you?</Text>
          <Text style={styles.description}>
            Your height is used to calculate your daily calorie needs.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              value={height ? height.toString() : ""}
              onChangeText={handleHeightChange}
              placeholder="175"
              keyboardType="numeric"
              keyboardAppearance={colorScheme}
              style={styles.heightInput}
              accessibilityLabel="Height input"
              selectTextOnFocus
            />
            <Text style={styles.unitText}>cm</Text>
          </View>
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
              disabled={!isValidHeight(height) || isNavigating}
            />
          </View>
        </View>
      </KeyboardStickyView>
    </GradientWrapper>
  );
};

export default HeightSelectionScreen;

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
    spacer: { flex: 1 },
    heightInput: {
      fontSize: 48,
      fontFamily: typography.Title1.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      minWidth: 100,
    },
    keyboardAccessory: {
      marginHorizontal: themeObj.spacing.sm,
      backgroundColor: colors.secondaryBackground,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: themeObj.spacing.sm,
      borderRadius: 9999,
      padding: themeObj.spacing.sm,
      overflow: "hidden",
      zIndex: 99,
    },
  });
};
