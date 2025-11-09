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
import { useTranslation } from "react-i18next";

const TargetMethodScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { safePush } = useNavigationGuard();
  const { setInputMethod } = useOnboardingStore();
  const { t } = useTranslation();

  const handleMethodSelect = async (method: "calculate" | "manual") => {
    setInputMethod(method);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (method === "calculate") {
      safePush("/onboarding/age");
    } else {
      safePush("/onboarding/manual-input");
    }
  };

  return (
    <OnboardingScreen
      title={<AppText role="Title2">{t("onboarding.targetMethod.title")}</AppText>}
      subtitle={
        <AppText role="Body" color="secondary" style={styles.secondaryText}>
          {t("onboarding.targetMethod.subtitle")}
        </AppText>
      }
    >
      <View style={styles.contentWrapper}>
        <View style={styles.methodsSection}>
          <SelectionCard
            title={t("onboarding.targetMethod.options.calculate.title")}
            description={t("onboarding.targetMethod.options.calculate.description")}
            icon={Calculator}
            iconColor={colors.accent}
            isSelected={false}
            onSelect={() => handleMethodSelect("calculate")}
            accessibilityLabel={t(
              "onboarding.targetMethod.options.calculate.accessibilityLabel"
            )}
            accessibilityHint={t(
              "onboarding.targetMethod.options.calculate.accessibilityHint"
            )}
          />

          <SelectionCard
            title={t("onboarding.targetMethod.options.manual.title")}
            description={t("onboarding.targetMethod.options.manual.description")}
            icon={Edit2}
            iconColor={colors.accent}
            isSelected={false}
            onSelect={() => handleMethodSelect("manual")}
            accessibilityLabel={t(
              "onboarding.targetMethod.options.manual.accessibilityLabel"
            )}
            accessibilityHint={t(
              "onboarding.targetMethod.options.manual.accessibilityHint"
            )}
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
