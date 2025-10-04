import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import { Calculator, Edit2 } from "lucide-react-native";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { OnboardingScreen } from "../../src/components/onboarding/OnboardingScreen";
import { useOnboardingStore } from "@/store/useOnboardingStore";

const TargetMethodScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { safePush } = useNavigationGuard();
  const { setInputMethod } = useOnboardingStore();

  const handleMethodSelect = async (method: "calculate" | "manual") => {
    setInputMethod(method);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (method === "calculate") {
      safePush("/onboarding/age");
    } else {
      safePush("/onboarding/manual-calories");
    }
  };

  return (
    <OnboardingScreen
      title={<AppText role="Title2">How would you like to set your nutrition targets?</AppText>}
      subtitle={
        <AppText role="Body" color="secondary" style={styles.secondaryText}>
          Choose the approach that works best for you.
        </AppText>
      }
    >
      <View style={styles.contentWrapper}>
        <View style={styles.methodsSection}>
          <SelectionCard
            title="Calculate for Me"
            description="Answer a few questions about your body and goals to get personalized targets"
            icon={Calculator}
            iconColor={colors.accent}
            isSelected={false}
            onSelect={() => handleMethodSelect("calculate")}
            accessibilityLabel="Calculate nutrition targets automatically"
            accessibilityHint="Answer questions about age, weight, height, activity level, and goals to calculate personalized daily targets"
          />

          <SelectionCard
            title="I Know My Targets"
            description="Set custom macro goals manually if you already have your targets"
            icon={Edit2}
            iconColor={colors.accent}
            isSelected={false}
            onSelect={() => handleMethodSelect("manual")}
            accessibilityLabel="Set custom nutrition targets manually"
            accessibilityHint="Manually enter your daily calorie, protein, fat, and carb targets"
          />
        </View>
      </View>
    </OnboardingScreen>
  );
};

export default TargetMethodScreen;

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing } = themeObj;

  return StyleSheet.create({
    secondaryText: {
      textAlign: "center",
      maxWidth: "75%",
      alignSelf: "center",
    },
    contentWrapper: {
      paddingHorizontal: spacing.md,
    },
    methodsSection: {
      gap: spacing.md,
    },
  });
};
