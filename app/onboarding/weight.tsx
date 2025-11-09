import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { Button } from "@/components/index";
import { OnboardingScreen } from "../../src/components/onboarding/OnboardingScreen";
import { AppText } from "@/components/shared/AppText";
import { RulerPicker } from "@/components/shared/RulerPicker";
import { useTranslation } from "react-i18next";

const WeightSelectionScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { weight, setWeight } = useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const [currentWeight, setCurrentWeight] = useState(weight || 70);
  const { t } = useTranslation();

  const handleContinue = async () => {
    setWeight(currentWeight);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush("/onboarding/activity-level");
  };

  const handleWeightChange = (value: number) => {
    setCurrentWeight(value);
  };

  return (
    <OnboardingScreen
      scrollEnabled={false}
      title={<AppText role="Title2">{t("onboarding.weight.title")}</AppText>}
      actionButton={
        <Button
          variant="primary"
          label={t("onboarding.common.continue")}
          onPress={handleContinue}
        />
      }
    >
      <View style={styles.pickerSection}>
        <RulerPicker
          min={30}
          max={300}
          value={currentWeight}
          onChange={handleWeightChange}
          unit={t("onboarding.weight.unit")}
        />
      </View>
    </OnboardingScreen>
  );
};

export default WeightSelectionScreen;

const createStyles = (colors: any, themeObj: any) => {
  const { spacing } = themeObj;
  return StyleSheet.create({
    secondaryText: {
      textAlign: "center",
      maxWidth: "75%",
      alignSelf: "center",
    },
    pickerSection: {
      alignItems: "center",
      width: "100%",
    },
  });
};
