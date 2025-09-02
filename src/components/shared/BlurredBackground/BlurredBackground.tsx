import React from "react";
import { ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { useTheme } from "@/theme";
import { createStyles } from "./BlurredBackground.styles";

interface BlurredBackgroundProps {
  position: "top" | "bottom";
  height?: number;
  intensity?: number;
  opacity?: number;
  style?: ViewStyle;
}

export const BlurredBackground: React.FC<BlurredBackgroundProps> = ({
  position,
  height = 265,
  intensity = 20,
  opacity = 0.6,
  style,
}) => {
  const { colors, colorScheme } = useTheme();
  const styles = createStyles(colors, height, position);

  const transparentBackground = colors.primaryBackground + "00";

  // Configure gradient based on position
  const gradientColors: [string, string] =
    position === "top"
      ? [colors.primaryBackground, transparentBackground]
      : [transparentBackground, colors.primaryBackground];

  const gradientLocations: [number, number] =
    position === "top" ? [0.65, 1] : [0, 0.35];

  const maskGradientColors: [string, string, string] =
    position === "top"
      ? [colors.secondaryBackground, colors.secondaryBackground, "transparent"]
      : ["transparent", colors.secondaryBackground, colors.secondaryBackground];

  const maskGradientLocations: [number, number, number] =
    position === "top" ? [0, 0.7, 1] : [0, 0.3, 1];

  return (
    <>
      <LinearGradient
        colors={gradientColors}
        locations={gradientLocations}
        style={[styles.gradientOverlay, { opacity }, style]}
        pointerEvents="none"
      />
      <MaskedView
        style={[styles.headerWrapper, style]}
        maskElement={
          <LinearGradient
            colors={maskGradientColors}
            locations={maskGradientLocations}
            style={{ flex: 1 }}
          />
        }
      >
        <BlurView
          intensity={intensity}
          tint={colorScheme}
          style={styles.blurContainer}
        />
      </MaskedView>
    </>
  );
};
