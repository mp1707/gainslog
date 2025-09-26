import React, { useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Info } from "lucide-react-native";
import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { Button } from "@/components/index";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { AppText } from "@/components/shared/AppText";
import { Picker } from "@react-native-picker/picker";
import { Tooltip } from "@/components/shared/Tooltip";

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
        <View style={styles.infoRow}>
          <AppText
            role="Body"
            color="secondary"
            style={styles.infoText}
          >
            For an accurate TDEE calculation.
          </AppText>
          <Tooltip text="TDEE stands for Total Daily Energy Expenditure—the estimated calories you burn each day based on your stats and activity level.">
            <Info size={18} color={colors.secondaryText} />
          </Tooltip>
        </View>
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
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      flexWrap: "wrap",
    },
    infoText: {
      textAlign: "center",
      flexShrink: 1,
    },
  });
};
