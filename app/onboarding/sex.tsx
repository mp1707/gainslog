import React, { useMemo, useCallback, useState } from "react";
import { View } from "react-native";
import { User } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { StyleSheet } from "react-native";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { useRouter } from "expo-router";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { AppText } from "@/components/shared/AppText";

const SexSelectionScreen = React.memo(function SexSelectionScreen() {
  const { theme: themeObj } = useTheme();
  const { sex, setSex } = useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const { back, dismissTo } = useRouter();
  const [selectedSex, setSelectedSex] = useState<"male" | "female" | undefined>(
    sex
  );

  const styles = useMemo(
    () => createStyles(themeObj),
    [themeObj]
  );

  const handleSexSelect = useCallback(
    async (selectedSex: "male" | "female") => {
      setSelectedSex(selectedSex);
      setSex(selectedSex);

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      safePush("/onboarding/height");
    },
    [setSex, safePush]
  );

  const handleCancel = () => {
    dismissTo("/");
  };
  const handleBack = () => {
    back();
  };

  return (
    <OnboardingScreen
      title={<AppText role="Title2">Biological Sex</AppText>}
      subtitle={
        <AppText role="Body" color="secondary" style={styles.secondaryText}>
          To refine your metabolic calculation.
        </AppText>
      }
    >
      <View style={styles.contentWrapper}>
        <View style={styles.selectionSection}>
          <SelectionCard
            title="Male"
            description=""
            icon={User}
            iconColor="#4A90E2"
            isSelected={selectedSex === "male"}
            onSelect={() => handleSexSelect("male")}
            accessibilityLabel="Select male as biological sex"
            accessibilityHint="This will help calculate your calorie needs and advance to the next step"
          />

          <SelectionCard
            title="Female"
            description=""
            icon={User}
            iconColor="#E24A90"
            isSelected={selectedSex === "female"}
            onSelect={() => handleSexSelect("female")}
            accessibilityLabel="Select female as biological sex"
            accessibilityHint="This will help calculate your calorie needs and advance to the next step"
          />
        </View>
      </View>
    </OnboardingScreen>
  );
});

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
