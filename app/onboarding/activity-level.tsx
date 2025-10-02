import React from "react";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { Home, User, Bike, Flame, Zap, Info } from "lucide-react-native";

import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { ACTIVITY_LEVELS } from "@/components/settings/calculationMethods";
import { StyleSheet } from "react-native";
import { UserSettings } from "@/types/models";
import { OnboardingScreen } from "../../src/components/onboarding/OnboardingScreen";
import { AppText } from "@/components/shared/AppText";
import { Tooltip } from "@/components/shared/Tooltip";

export default function Step2ActivityLevelScreen() {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(themeObj);
  const { activityLevel, setActivityLevel } = useOnboardingStore();
  const { safePush } = useNavigationGuard();

  const handleActivityLevelSelect = async (
    level: UserSettings["activityLevel"]
  ) => {
    setActivityLevel(level);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    safePush("/onboarding/calorie-goal");
  };

  const activityLevels = Object.values(ACTIVITY_LEVELS);

  return (
    <OnboardingScreen
      title={<AppText role="Title2">How active are you?</AppText>}
      subtitle={
        <View style={styles.infoRow}>
          <AppText role="Body" color="secondary" style={styles.infoText}>
            Select your baseline. This is used to calibrate your TDEE.
          </AppText>
          <Tooltip text="TDEE stands for Total Daily Energy Expenditure—the estimated calories you burn each day based on your stats and activity level.">
            <Info size={18} color={colors.secondaryText} />
          </Tooltip>
        </View>
      }
    >
      <View style={styles.methodsSection}>
        {activityLevels.map((level) => {
          // Map activity level to appropriate icon
          const getIcon = (id: string) => {
            switch (id) {
              case "sedentary":
                return Home;
              case "light":
                return User;
              case "moderate":
                return Bike;
              case "active":
                return Flame;
              case "veryactive":
                return Zap;
              default:
                return User;
            }
          };

          return (
            <SelectionCard
              key={level.id}
              title={level.title}
              description={level.description}
              icon={getIcon(level.id)}
              iconColor={colors.secondaryText}
              isSelected={activityLevel === level.id}
              onSelect={() => handleActivityLevelSelect(level.id)}
              accessibilityLabel={`${level.title} activity level`}
              accessibilityHint={`Calculate calories for ${level.description.toLowerCase()}`}
            />
          );
        })}
      </View>
    </OnboardingScreen>
  );
}

type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (themeObj: Theme) => {
  const { spacing } = themeObj;

  return StyleSheet.create({
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
      flex: 1,
    },
    methodsSection: {
      gap: spacing.md,
      paddingHorizontal: spacing.md,
    },
  });
};
