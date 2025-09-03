import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useStyles } from "./ModalHeader.styles";

interface ModalHeaderProps {
  leftButton: {
    label: string;
    onPress: () => void;
  };
  rightButton?: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
  };
  centerContent?: React.ReactNode;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  leftButton,
  rightButton,
  centerContent,
}) => {
  const styles = useStyles();

  return (
    <View style={styles.header}>
      <View style={styles.buttonContainer}>
        {leftButton && (
          <TouchableOpacity
            onPress={leftButton.onPress}
            accessibilityRole="button"
            accessibilityLabel={leftButton.label}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          >
            <Text style={styles.cancelButton}>{leftButton.label}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.centerContainer}>
        {centerContent}
      </View>
      
      <View style={styles.rightButtonContainer}>
        {rightButton && (
          <TouchableOpacity 
            onPress={rightButton.onPress} 
            disabled={rightButton.disabled}
            accessibilityRole="button"
            accessibilityLabel={rightButton.label}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          >
            <Text
              style={[
                styles.saveButton, 
                rightButton.disabled && styles.saveButtonDisabled
              ]}
            >
              {rightButton.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
