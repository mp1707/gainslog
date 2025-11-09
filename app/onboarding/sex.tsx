import React, { useMemo, useCallback } from "react";
import { View } from "react-native";
import { User } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { StyleSheet } from "react-native";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { OnboardingScreen } from "../../src/components/onboarding/OnboardingScreen";
import { AppText } from "@/components/shared/AppText";
import { useTranslation } from "react-i18next";

const SexSelectionScreen = () => {
  const { theme: themeObj } = useTheme();
  const { sex, setSex } = useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const { t } = useTranslation();

  const styles = useMemo(() => createStyles(themeObj), [themeObj]);

  const handleSexSelect = useCallback(
    async (selectedSex: "male" | "female") => {
      setSex(selectedSex);

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      safePush("/onboarding/height");
    },
    [setSex, safePush]
  );

  return (
    <OnboardingScreen
      title={<AppText role="Title2">{t("onboarding.sex.title")}</AppText>}
      subtitle={
        <AppText role="Body" color="secondary" style={styles.secondaryText}>
          {t("onboarding.sex.subtitle")}
        </AppText>
      }
    >
      <View style={styles.contentWrapper}>
        <View style={styles.selectionSection}>
          {(["male", "female"] as const).map((option) => (
            <SelectionCard
              key={option}
              title={t(`onboarding.sex.options.${option}`)}
              description=""
              icon={User}
              iconColor={option === "male" ? "#4A90E2" : "#E24A90"}
              isSelected={sex === option}
              onSelect={() => handleSexSelect(option)}
              accessibilityLabel={t("onboarding.sex.accessibility.label", {
                option: t(`onboarding.sex.options.${option}`),
              })}
              accessibilityHint={t("onboarding.sex.accessibility.hint")}
            />
          ))}
        </View>
      </View>
    </OnboardingScreen>
  );
};

export default SexSelectionScreen;

type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (theme: Theme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    secondaryText: {
      textAlign: "center",
      maxWidth: "75%",
      alignSelf: "center",
    },
    contentWrapper: {
      paddingHorizontal: spacing.pageMargins.horizontal,
    },
    selectionSection: {
      gap: spacing.md,
    },
  });
};
