import React, { useCallback } from "react";
import { View, Keyboard } from "react-native";
import { useTranslation } from "react-i18next";
import { RoundButton } from "@/components/shared/RoundButton";
import { ChevronLeft, X } from "lucide-react-native";
import { createStyles } from "./ModalHeader.styles";
import { useTheme } from "@/theme/ThemeProvider";

interface ModalHeaderProps {
  handleBack: () => void;
  handleCancel: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  handleBack,
  handleCancel,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const onBackPress = useCallback(() => {
    Keyboard.dismiss();
    setTimeout(() => {
      handleBack();
    }, 120);
  }, [handleBack]);

  const backAccessibilityLabel = t(
    "dailyFoodLogs.modalHeader.back.accessibilityLabel"
  );
  const backAccessibilityHint = t(
    "dailyFoodLogs.modalHeader.back.accessibilityHint"
  );
  const closeAccessibilityLabel = t(
    "dailyFoodLogs.modalHeader.close.accessibilityLabel"
  );
  const closeAccessibilityHint = t(
    "dailyFoodLogs.modalHeader.close.accessibilityHint"
  );

  return (
    <View style={styles.container}>
      <RoundButton
        onPress={onBackPress}
        Icon={ChevronLeft}
        variant="tertiary"
        accessibilityLabel={backAccessibilityLabel}
        accessibilityHint={backAccessibilityHint}
      />
      <RoundButton
        onPress={handleCancel}
        Icon={X}
        variant="tertiary"
        accessibilityLabel={closeAccessibilityLabel}
        accessibilityHint={closeAccessibilityHint}
      />
    </View>
  );
};
