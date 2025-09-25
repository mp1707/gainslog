import React, { useMemo, useState } from "react";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { Home, User, Bike, Flame, Zap } from "lucide-react-native";

import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { ACTIVITY_LEVELS } from "@/components/settings/calculationMethods";
import { StyleSheet } from "react-native";
import { UserSettings } from "@/types/models";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { AppText } from "@/components/shared/AppText";

export default function Step2ActivityLevelScreen() {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(themeObj);
  const { setActivityLevel } = useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const [selectedActivity, setSelectedActivity] = useState<
    UserSettings["activityLevel"] | undefined
  >();

  const handleActivityLevelSelect = async (
    level: UserSettings["activityLevel"]
  ) => {
    setSelectedActivity(level);
    setActivityLevel(level);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setTimeout(() => {
      safePush("/onboarding/calorie-goal");
    }, 300);
  };

  const activityLevels = Object.values(ACTIVITY_LEVELS);

  return (
    <OnboardingScreen>
      <View style={styles.textSection}>
        <AppText role="Title2">How active are you?</AppText>
        <AppText
          role="Body"
          color="secondary"
          style={{ textAlign: "center" }}
        >
          Select your baseline. This is used to calibrate your TDEE.
        </AppText>
      </View>

      <View style={styles.methodsSection}>
        {activityLevels.map((activityLevel) => {
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
              key={activityLevel.id}
              title={activityLevel.title}
              description={activityLevel.description}
              icon={getIcon(activityLevel.id)}
              iconColor={colors.secondaryText}
              isSelected={selectedActivity === activityLevel.id}
              onSelect={() => handleActivityLevelSelect(activityLevel.id)}
              accessibilityLabel={`${activityLevel.title} activity level`}
              accessibilityHint={`Calculate calories for ${activityLevel.description.toLowerCase()}`}
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
    textSection: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    methodsSection: {
      gap: spacing.md,
    },
  });
};
