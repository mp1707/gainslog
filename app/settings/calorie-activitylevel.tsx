import React, { useMemo, useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Home,
  User,
  Bike,
  Flame,
  Zap,
} from "lucide-react-native";

import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { ACTIVITY_LEVELS } from "@/components/settings/calculationMethods";
import { StyleSheet } from "react-native";
import { UserSettings } from "@/types/models";
import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";

export default function Step2ActivityLevelScreen() {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { userSettings, setUserSettings } = useAppStore();
  const { safeNavigate } = useNavigationGuard();
  const { back } = useRouter();
  const [selectedActivity, setSelectedActivity] = useState<UserSettings["activityLevel"] | undefined>();

  const handleCancel = () => {
    back();
  };

  const handleActivityLevelSelect = async (
    activityLevel: UserSettings["activityLevel"]
  ) => {
    if (!userSettings) return;

    setSelectedActivity(activityLevel);
    setUserSettings({
      ...userSettings,
      activityLevel,
    });

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setTimeout(() => {
      safeNavigate("/settings/calorie-goals");
    }, 300);
  };


  const activityLevels = Object.values(ACTIVITY_LEVELS);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <View style={styles.container}>
        <ModalHeader 
          leftButton={{ label: "Back", onPress: handleCancel }}
        />
        
        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.textSection}>
            <Text style={styles.subtitle}>Choose your activity level</Text>
            <Text style={styles.description}>
              Select the option that best matches your lifestyle and exercise
              routine.
            </Text>
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
      </View>
    </KeyboardAvoidingView>
  );
}

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing, typography } = themeObj;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingTop: spacing.lg,
      paddingBottom: 100,
    },
    textSection: {
      marginBottom: spacing.xl,
    },
    subtitle: {
      fontSize: typography.Title2.fontSize,
      fontFamily: typography.Title2.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      marginBottom: spacing.md,
    },
    description: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
    },
    methodsSection: {
      marginBottom: spacing.lg,
      gap: spacing.md,
    },
  });
};
