import React from "react";
import { View, Text } from "react-native";
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
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <RoundButton
        onPress={handleBack}
        Icon={ChevronLeft}
        variant="tertiary"
        accessibilityLabel="Go back"
        accessibilityHint="Returns to previous screen"
      />
      <RoundButton
        onPress={handleCancel}
        Icon={X}
        variant="tertiary"
        accessibilityLabel="Close setup"
        accessibilityHint="Exits the setup and returns to the home screen"
      />
    </View>
  );
};
