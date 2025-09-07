import React from "react";
import { View, Text } from "react-native";
import { RoundButton } from "@/components/shared/RoundButton";
import { X } from "lucide-react-native";
import { useStyles } from "./ModalHeader.styles";

interface ModalHeaderProps {
  title?: string;
  onClose: () => void;
  closeAccessibilityLabel?: string;
  closeAccessibilityHint?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  closeAccessibilityLabel,
  closeAccessibilityHint,
}) => {
  const styles = useStyles();

  return (
    <View style={styles.header}>
      <RoundButton
        onPress={onClose}
        Icon={X}
        variant="tertiary"
        accessibilityLabel={closeAccessibilityLabel || "Close"}
        accessibilityHint={closeAccessibilityHint}
        style={styles.invisibleCloseButton}
      />
      <View style={styles.centerContainer}>
        {title && <Text style={styles.title}>{title}</Text>}
      </View>

      <View style={styles.closeButtonContainer}>
        <RoundButton
          onPress={onClose}
          Icon={X}
          variant="tertiary"
          accessibilityLabel={closeAccessibilityLabel || "Close"}
          accessibilityHint={closeAccessibilityHint}
        />
      </View>
    </View>
  );
};
