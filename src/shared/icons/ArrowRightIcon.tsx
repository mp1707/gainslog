import React from "react";
import Svg, { Path } from "react-native-svg";
import type { IconProps } from "./ArrowLeftIcon";

const ArrowRightIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2H4zm10-4h2v2h-2V7zm0 0h-2V5h2v2zm0 10h2v-2h-2v2zm0 0h-2v2h2v-2z"
        fill={color}
      />
    </Svg>
  );
};

export default ArrowRightIcon;
