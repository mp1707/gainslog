import React from "react";
import Svg, { Path } from "react-native-svg";
import type { IconProps } from "./ArrowLeftIcon";

const PencilIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 2h-2v2h-2v2h-2v2h-2v2H8v2H6v2H4v2H2v6h6v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2V8h2V6h-2V4h-2V2zm0 8h-2v2h-2v2h-2v2h-2v2H8v-2H6v-2h2v-2h2v-2h2V8h2V6h2v2h2v2zM6 16H4v4h4v-2H6v-2z"
        fill={color}
      />
    </Svg>
  );
};

export default PencilIcon;
