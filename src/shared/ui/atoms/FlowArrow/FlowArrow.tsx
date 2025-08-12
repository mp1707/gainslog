import React from "react";
import { View } from "react-native";
import { ArrowDownIcon } from "phosphor-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./FlowArrow.styles";

interface FlowArrowProps {
  visible: boolean;
}

export const FlowArrow: React.FC<FlowArrowProps> = ({ visible }) => {
  const { colors } = useTheme();
  const styles = createStyles();

  if (!visible) return null;

  return (
    <View
      style={styles.flowArrowContainer}
      accessibilityRole="image"
      accessibilityLabel="Step completed, proceed to next step"
      accessibilityHint="Visual indicator showing flow to next step"
    >
      <ArrowDownIcon
        size={20}
        color={colors.semantic.calories}
        weight="regular"
      />
    </View>
  );
};
