import React from "react";
import Svg, { Path } from "react-native-svg";
import type { IconProps } from "./ArrowLeftIcon";

const SettingsIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 2H9v2H7v6h2V4h6V2zm0 8H9v2h6v-2zm0-6h2v6h-2V4zM4 16h2v-2h12v2H6v4h12v-4h2v6H4v-6z"
        fill={color}
      />
    </Svg>
  );
};

export default SettingsIcon;
