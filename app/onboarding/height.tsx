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

const HeightSelectionScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { height: storedHeight, setHeight: setStoredHeight } = useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const [selectedHeight, setSelectedHeight] = useState<number>(storedHeight || 175);

  // Create height options array
  const heightOptions = useMemo(() => {
    const options: number[] = [];
    for (let i = 100; i <= 250; i++) {
      options.push(i);
    }
    return options;
  }, []);

  const handleContinue = async () => {
    setStoredHeight(selectedHeight);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush("/onboarding/weight");
  };

  const handleHeightChange = (value: number) => {
    setSelectedHeight(value);
  };

  return (
    <GradientWrapper style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>How tall are you?</Text>
          <Text style={styles.description}>
            Your height is used to calculate your daily calorie needs.
          </Text>
        </View>

        <View style={styles.pickerSection}>
          <View style={styles.pickerArea}>
            <View style={styles.pickerCol}>
              <Picker
                selectedValue={selectedHeight}
                onValueChange={(value) => handleHeightChange(Number(value))}
                itemStyle={{ color: colors.primaryText }}
              >
                {heightOptions.map((height) => (
                  <Picker.Item key={height} label={`${height} cm`} value={height} />
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

export default HeightSelectionScreen;

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
