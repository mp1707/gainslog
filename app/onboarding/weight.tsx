import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { Button } from "@/components/index";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { AppText } from "@/components/shared/AppText";
import { RulerPicker } from "@/components/shared/RulerPicker";

const WeightSelectionScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { weight: storedWeight, setWeight: setStoredWeight } =
    useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const [selectedWeight, setSelectedWeight] = useState<number>(
    storedWeight || 70
  );

  const handleContinue = async () => {
    setStoredWeight(selectedWeight);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush("/onboarding/activity-level");
  };

  const handleWeightChange = (value: number) => {
    setSelectedWeight(value);
  };

  return (
    <OnboardingScreen
      title={<AppText role="Title2">What's your current weight?</AppText>}
      subtitle={
        <AppText role="Body" color="secondary" style={styles.secondaryText}>
          This sets the starting point for your goals.
        </AppText>
      }
      actionButton={
        <Button variant="primary" label="Continue" onPress={handleContinue} />
      }
    >
      <View style={styles.pickerSection}>
        <RulerPicker
          min={30}
          max={300}
          value={selectedWeight}
          onChange={handleWeightChange}
          unit="kg"
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
