import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Info } from "lucide-react-native";
import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { Button } from "@/components/index";
import { OnboardingScreen } from "../../src/components/onboarding/OnboardingScreen";
import { AppText } from "@/components/shared/AppText";
import { Tooltip } from "@/components/shared/Tooltip";
import { RulerPicker } from "@/components/shared/RulerPicker";

const HeightSelectionScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { height, setHeight } = useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const [currentHeight, setCurrentHeight] = useState(height || 175);

  const handleContinue = async () => {
    setHeight(currentHeight);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush("/onboarding/weight");
  };

  const handleHeightChange = (value: number) => {
    setCurrentHeight(value);
  };

  return (
    <OnboardingScreen
      scrollEnabled={false}
      title={<AppText role="Title2">And your height?</AppText>}
      subtitle={
        <View style={styles.infoRow}>
          <AppText role="Body" color="secondary" style={styles.infoText}>
            For an accurate TDEE calculation.
          </AppText>
          <Tooltip text="TDEE stands for Total Daily Energy Expenditure—the estimated calories you burn each day based on your stats and activity level.">
            <Info size={18} color={colors.secondaryText} />
          </Tooltip>
        </View>
      }
      actionButton={
        <Button variant="primary" label="Continue" onPress={handleContinue} />
      }
    >
      <View style={styles.pickerSection}>
        <RulerPicker
          min={100}
          max={250}
          value={currentHeight}
          onChange={handleHeightChange}
          unit="cm"
        />
      </View>
    </OnboardingScreen>
  );
};

export default HeightSelectionScreen;

const createStyles = (colors: any, themeObj: any) => {
  const { spacing } = themeObj;
  return StyleSheet.create({
    pickerSection: {
      alignItems: "center",
      width: "100%",
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      gap: spacing.xs,
      maxWidth: "75%",
    },
    infoText: {
      textAlign: "center",
    },
  });
};
