import React from "react";
import { InputAccessoryView as RNInputAccessoryView } from "react-native";
import type { Icon } from "phosphor-react-native";

import { InputAccessoryView } from "./InputAccessoryView";

interface ActionButton {
  icon: Icon;
  label: string;
  onPress: () => void;
  isValid?: boolean;
}

interface InputAccessoryProps {
  nativeID: string;
  primaryAction?: ActionButton;
  secondaryAction?: ActionButton;
  tertiaryAction?: ActionButton;
  accessibilityLabel: string;
}

export function InputAccessory({
  nativeID,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  accessibilityLabel,
}: InputAccessoryProps) {
  return (
    <RNInputAccessoryView nativeID={nativeID}>
      <InputAccessoryView
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        tertiaryAction={tertiaryAction}
        accessibilityLabel={accessibilityLabel}
      />
    </RNInputAccessoryView>
  );
}
