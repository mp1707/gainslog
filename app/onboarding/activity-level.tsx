import React, { useMemo, useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Home, User, Bike, Flame, Zap } from "lucide-react-native";

import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { ACTIVITY_LEVELS } from "@/components/settings/calculationMethods";
import { StyleSheet } from "react-native";
import { UserSettings } from "@/types/models";
import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { AppText } from "@/components/shared/AppText";

export default function Step2ActivityLevelScreen() {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { activityLevel, setActivityLevel } = useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const { back } = useRouter();
  const router = useRouter();
  const [selectedActivity, setSelectedActivity] = useState<
    UserSettings["activityLevel"] | undefined
  >();

  const handleCancel = () => {
    router.dismissTo("/");
  };

  const handleBack = () => {
    back();
  };

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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <GradientWrapper style={styles.container}>
        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.textSection}>
            <AppText role="Title2">Choose your activity level</AppText>
            <AppText
              role="Body"
              color="secondary"
              style={{ textAlign: "center" }}
            >
              Select the option that best matches your lifestyle and exercise
              routine.
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
        </ScrollView>
      </GradientWrapper>
    </KeyboardAvoidingView>
  );
}

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing } = themeObj;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
      gap: themeObj.spacing.md,
    },
    content: {
      flex: 1,
      paddingTop: spacing.xxl + spacing.xl,
    },
    scrollContent: {
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingBottom: 100,
    },
    textSection: {
      marginBottom: spacing.xl,
      alignItems: "center",
    },
    methodsSection: {
      marginBottom: spacing.lg,
      gap: spacing.md,
    },
  });
};
