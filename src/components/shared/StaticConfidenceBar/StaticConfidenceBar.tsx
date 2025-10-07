import React, { useMemo } from "react";
import { View } from "react-native";

import { useTheme } from "@/theme";
import { createStyles } from "./StaticConfidenceBar.styles";

type ConfidenceLevel = 0 | 1 | 2 | 3;

interface StaticConfidenceBarProps {
  confidenceLevel: ConfidenceLevel;
}

export const StaticConfidenceBar: React.FC<StaticConfidenceBarProps> = ({
  confidenceLevel,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const bars = [0, 1, 2];

  return (
    <View style={styles.barsContainer}>
      {bars.map((index) => {
        const isFilled = index < confidenceLevel;
        return (
          <View
            key={`bar-${index}`}
            style={[
              styles.barTrack,
              index !== bars.length - 1 ? styles.barTrackSpacing : null,
            ]}
          >
            {isFilled && <View style={styles.barFill} />}
          </View>
        );
      })}
    </View>
  );
};
