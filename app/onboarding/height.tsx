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

const HeightSelectionScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { height: storedHeight, setHeight: setStoredHeight } =
    useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const [selectedHeight, setSelectedHeight] = useState<number>(
    storedHeight || 175
  );

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
        <AppText role="Title2">And your height?</AppText>
        <AppText role="Body" color="secondary" style={{ textAlign: "center" }}>
          For an accurate TDEE calculation.
        </AppText>
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
                <Picker.Item
                  key={height}
                  label={height.toString()}
                  value={height}
                />
              ))}
            </Picker>
          </View>
          <AppText role="Headline" style={styles.unitText}>
            cm
          </AppText>
        </View>
      </View>
    </OnboardingScreen>
  );
};

export default HeightSelectionScreen;

const createStyles = (colors: any, themeObj: any) => {
  const { spacing } = themeObj;
  return StyleSheet.create({
    textSection: {
      gap: spacing.sm,
      alignItems: "center",
      marginBottom: spacing.xl,
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
