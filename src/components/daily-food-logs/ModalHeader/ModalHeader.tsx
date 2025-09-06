import React from "react";
import { View, Text } from "react-native";
import { CloseButton } from "@/components/shared/CloseButton";
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
      <CloseButton
        onPress={onClose}
        accessibilityLabel={closeAccessibilityLabel}
        accessibilityHint={closeAccessibilityHint}
        style={styles.invisibleCloseButton}
      />
      <View style={styles.centerContainer}>
        {title && <Text style={styles.title}>{title}</Text>}
      </View>

      <View style={styles.closeButtonContainer}>
        <CloseButton
          onPress={onClose}
          accessibilityLabel={closeAccessibilityLabel}
          accessibilityHint={closeAccessibilityHint}
        />
      </View>
    </View>
  );
};
