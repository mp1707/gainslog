import React from "react";
import { Image, Platform } from "react-native";
import type { ImageStyle, StyleProp, ImageSourcePropType } from "react-native";

type AppIconProps = {
  source: ImageSourcePropType;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

const getHomeScreenIconSize = (): number => {
  if (Platform.OS === "ios") {
    // iPhone home screen icon is 60pt, iPad is 76pt
    const isPad = (Platform as any).isPad as boolean | undefined;
    return isPad ? 76 : 60;
  }
  // Typical Android launcher icon target size in dp
  return 48;
};

export const AppIcon: React.FC<AppIconProps> = ({ source, size, style }) => {
  const resolvedSize = size ?? getHomeScreenIconSize();
  const cornerRadius = Math.round(
    resolvedSize * (Platform.OS === "ios" ? 0.22 : 0.2)
  );

  return (
    <Image
      accessibilityLabel="App icon preview"
      source={source}
      style={[
        {
          width: resolvedSize,
          height: resolvedSize,
          borderRadius: cornerRadius,
          overflow: "hidden",
        },
        style,
      ]}
    />
  );
};
