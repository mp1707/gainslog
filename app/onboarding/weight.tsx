import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { Button } from "@/components/index";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { Picker } from "@react-native-picker/picker";

const WeightSelectionScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { weight: storedWeight, setWeight: setStoredWeight } = useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const [selectedWeight, setSelectedWeight] = useState<number>(storedWeight || 70);

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
    <GradientWrapper style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>What's your weight?</Text>
          <Text style={styles.description}>
            Your weight is important for calculating your calorie needs.
          </Text>
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
                  <Picker.Item key={weight} label={`${weight} kg`} value={weight} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonSection}>
          <Button
            variant="primary"
            label="Continue"
            Icon={ChevronRight}
            iconPlacement="right"
            onPress={handleContinue}
          />
        </View>
      </View>
    </GradientWrapper>
  );
};

export default WeightSelectionScreen;

const createStyles = (colors: any, themeObj: any) => {
  const { spacing, typography } = themeObj;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingTop: spacing.xl,
      gap: spacing.xl,
    },
    textSection: {
      gap: spacing.sm,
      alignItems: "center",
    },
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
    pickerSection: {
      alignItems: "center",
    },
    pickerArea: {
      flexDirection: "row",
      justifyContent: "space-between",
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
    spacer: {
      flex: 1
    },
    buttonSection: {
      paddingBottom: spacing.xl,
    },
  });
};
