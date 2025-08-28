import React from "react";
import { InputAccessoryView as RNInputAccessoryView } from "react-native";

import { InputAccessoryView } from "./InputAccessoryView";

interface InputAccessoryProps {
  nativeID: string;
  isValid: boolean;
  primaryText?: string;
  onPrimaryPress: () => void;
  secondaryText?: string;
  onSecondaryPress?: () => void;
  accessibilityLabel: string;
}

export function InputAccessory({
  nativeID,
  isValid,
  primaryText = "Continue",
  onPrimaryPress,
  secondaryText,
  onSecondaryPress,
  accessibilityLabel,
}: InputAccessoryProps) {
  return (
    <RNInputAccessoryView nativeID={nativeID}>
      <InputAccessoryView
        primaryText={primaryText}
        onPrimaryPress={onPrimaryPress}
        isValid={isValid}
        secondaryText={secondaryText}
        onSecondaryPress={onSecondaryPress}
        accessibilityLabel={accessibilityLabel}
      />
    </RNInputAccessoryView>
  );
}
