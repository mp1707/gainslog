import React, { useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors, Theme, useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { Button } from "@/components/index";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { AppText } from "@/components/shared/AppText";
import { Picker } from "@react-native-picker/picker";

const AgeSelectionScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { age, setAge } = useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const [selectedAge, setSelectedAge] = useState<number>(age || 30);

  // Create age options array
  const ageOptions = useMemo(() => {
    const options: number[] = [];
    for (let i = 15; i <= 100; i++) {
      options.push(i);
    }
    return options;
  }, []);

  const handleContinue = async () => {
    setAge(selectedAge);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush("/onboarding/sex");
  };

  const handleAgeChange = (value: number) => {
    setSelectedAge(value);
  };

  return (
    <GradientWrapper style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textSection}>
          <AppText role="Title2">How old are you?</AppText>
          <AppText role="Body" color="secondary">
            Your age helps us calculate your calorie needs.
          </AppText>
        </View>

        <View style={styles.pickerSection}>
          <View style={styles.pickerArea}>
            <View style={styles.pickerCol}>
              <Picker
                selectedValue={selectedAge}
                onValueChange={(value) => handleAgeChange(Number(value))}
                itemStyle={{ color: colors.primaryText }}
              >
                {ageOptions.map((age) => (
                  <Picker.Item key={age} label={age.toString()} value={age} />
                ))}
              </Picker>
            </View>
            <AppText role="Headline" style={styles.unitText}>
              years
            </AppText>
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

export default AgeSelectionScreen;

const createStyles = (colors: Colors, theme: Theme) => {
  const { spacing } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingTop: spacing.xxl + spacing.xl,

      gap: spacing.xl,
    },
    textSection: {
      gap: spacing.sm,
      alignItems: "center",
    },
    pickerSection: {
      alignItems: "center",
    },
    pickerArea: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.primaryBackground,
      borderRadius: theme.components.cards.cornerRadius,
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
    spacer: {
      flex: 1,
    },
    buttonSection: {
      paddingBottom: spacing.xl,
    },
  });
};
