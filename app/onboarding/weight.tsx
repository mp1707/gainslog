import React, { useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { Button } from "@/components/index";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { AppText } from "@/components/shared/AppText";
import { Picker } from "@react-native-picker/picker";

const WeightSelectionScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { weight: storedWeight, setWeight: setStoredWeight } =
    useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const [selectedWeight, setSelectedWeight] = useState<number>(
    storedWeight || 70
  );

  // Create weight options array
  const weightOptions = useMemo(() => {
    const options: number[] = [];
    for (let i = 30; i <= 300; i++) {
      options.push(i);
    }
    return options;
  }, []);

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
      actionButton={
        <Button
          variant="primary"
          label="Continue"
          onPress={handleContinue}
        />
      }
    >
      <View style={styles.textSection}>
        <AppText role="Title2">What's your current weight?</AppText>
        <AppText role="Body" color="secondary" style={styles.secondaryText}>
          This sets the starting point for your goals.
        </AppText>
      </View>

      <View style={styles.pickerSection}>
        <View style={styles.pickerArea}>
          <View style={styles.pickerCol}>
            <Picker
              selectedValue={selectedWeight}
              onValueChange={(value) => handleWeightChange(Number(value))}
              itemStyle={{ color: colors.primaryText }}
            >
              {weightOptions.map((weight) => (
                <Picker.Item
                  key={weight}
                  label={weight.toString()}
                  value={weight}
                />
              ))}
            </Picker>
          </View>
          <AppText role="Headline" style={styles.unitText}>
            kg
          </AppText>
        </View>
      </View>
    </OnboardingScreen>
  );
};

export default WeightSelectionScreen;

const createStyles = (colors: any, themeObj: any) => {
  const { spacing } = themeObj;
  return StyleSheet.create({
    textSection: {
      gap: spacing.sm,
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    secondaryText: {
      textAlign: "center",
      maxWidth: "75%",
      alignSelf: "center",
    },
    pickerSection: {
      alignItems: "center",
    },
    pickerArea: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.primaryBackground,
      borderRadius: themeObj.components.cards.cornerRadius,
      minWidth: 200,
    },
    pickerCol: {
      flex: 1,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: "transparent",
    },
    unitText: {
      paddingRight: spacing.md,
    },
  });
};
