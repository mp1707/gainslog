import React from "react";
import { View, ViewStyle } from "react-native";
import { Wand2, Check, BadgeCheck } from "lucide-react-native";
import { AppText } from "@/components";
import { getConfidenceLevel } from "@/utils/getConfidenceLevel";
import { useTheme } from "@/theme";
import { createStyles } from "./LogStatusBadge.styles";

interface LogStatusBadgeProps {
  estimationConfidence?: number;
  style?: ViewStyle;
}

const statusConfig = {
  3: { label: "Verified", Icon: BadgeCheck, status: "complete" as const },
  2: { label: "Detailed", Icon: Check, status: "confirmed" as const },
  1: { label: "Refine Estimate", Icon: Wand2, status: "potential" as const },
  0: { label: "Refine Estimate", Icon: Wand2, status: "potential" as const },
};

export const LogStatusBadge: React.FC<LogStatusBadgeProps> = ({
  estimationConfidence,
  style,
}) => {
  if (estimationConfidence === undefined) {
    return null;
  }

  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  const { confidenceLevel } = getConfidenceLevel(estimationConfidence);
  const config = statusConfig[confidenceLevel] || statusConfig[0];

  // CORRECTED: Get the specific color object for the current status.
  // This makes the component dynamic.
  const styleInfo = colors.logStatus[config.status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: styleInfo.background }, // CORRECTED: Use dynamic background color
        style,
      ]}
    >
      <config.Icon
        size={16}
        // CORRECTED: Use dynamic icon color from our theme object.
        // It correctly falls back to the text color if a special iconColor isn't defined.
        color={styleInfo.iconColor}
        strokeWidth={2.5}
      />
      <AppText
        style={[
          styles.text,
          { color: styleInfo.text }, // CORRECTED: Use dynamic text color
        ]}
      >
        {config.label}
      </AppText>
    </View>
  );
};
