import React, { useMemo } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import type { Icon } from "phosphor-react-native";

import { useTheme } from "@/theme";
import { createStyles } from "./InputAccessory.styles";

interface ActionButton {
  icon: Icon;
  label: string;
  onPress: () => void;
  isValid?: boolean;
}

interface InputAccessoryViewProps {
  primaryAction?: ActionButton;
  secondaryAction?: ActionButton;
  tertiaryAction?: ActionButton;
  accessibilityLabel: string;
}

export function InputAccessoryView({
  primaryAction,
  secondaryAction,
  tertiaryAction,
  accessibilityLabel,
}: InputAccessoryViewProps) {
  const { colors, theme: themeObj } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const actions = [secondaryAction, tertiaryAction, primaryAction].filter(
    Boolean
  ) as ActionButton[];
  const buttonCount = actions.length;

  const renderButton = (
    action: ActionButton,
    position: "secondary" | "tertiary" | "primary",
    index: number
  ) => {
    const IconComponent = action.icon;
    const isPrimary = position === "primary";
    const isSecondary = position === "secondary";
    const isTertiary = position === "tertiary";
    const isDisabled = action.isValid === false;

    return (
      <TouchableOpacity
        key={`${position}-${index}`}
        style={[
          styles.buttonBase,
          isPrimary && styles.primaryButton,
          isSecondary && styles.secondaryButton,
          isTertiary && styles.tertiaryButton,
          isPrimary && isDisabled && styles.primaryButtonDisabled,
          buttonCount === 1 && { flex: 1 },
          buttonCount > 1 && { flex: 1 },
        ]}
        onPress={isDisabled ? undefined : action.onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={
          isPrimary ? accessibilityLabel : `${action.label} button`
        }
      >
        {action.label && action.label !== "" && (
          <Text
            style={[
              isPrimary && styles.primaryButtonText,
              isSecondary && styles.secondaryButtonText,
              isTertiary && styles.tertiaryButtonText,
              isPrimary && isDisabled && styles.primaryButtonTextDisabled,
            ]}
          >
            {action.label}
          </Text>
        )}
        <IconComponent
          size={20}
          color={
            isPrimary
              ? isDisabled
                ? colors.disabledText
                : "#FFFFFF"
              : isSecondary
              ? colors.primaryText
              : isTertiary
              ? colors.primaryText
              : colors.primaryText
          }
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.inputAccessoryContainer}>
      <View style={styles.inputAccessoryContent}>
        <View
          style={[
            buttonCount > 1
              ? styles.buttonsContainer
              : styles.singleButtonContainer,
          ]}
        >
          {/* Render buttons in order: Secondary, Tertiary, Primary */}
          {secondaryAction && renderButton(secondaryAction, "secondary", 0)}
          {tertiaryAction && renderButton(tertiaryAction, "tertiary", 1)}
          {primaryAction && renderButton(primaryAction, "primary", 2)}
        </View>
      </View>
    </View>
  );
}
