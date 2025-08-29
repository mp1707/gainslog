import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useStyles } from "./ModalHeader.styles";
import { DateNavigationHeader } from "../DateNavigationHeader";

interface ModalHeaderProps {
  disabled?: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  disabled = false,
  onCancel,
  onSave,
}) => {
  const styles = useStyles();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Cancel"
        hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
      >
        <Text style={styles.cancelButton}>Cancel</Text>
      </TouchableOpacity>
      {/* <Text style={styles.title}>New Log</Text> */}
      <DateNavigationHeader compact={true} />
      <TouchableOpacity onPress={onSave} disabled={disabled}>
        <Text
          style={[styles.saveButton, disabled && styles.saveButtonDisabled]}
        >
          Done
        </Text>
      </TouchableOpacity>
    </View>
  );
};
