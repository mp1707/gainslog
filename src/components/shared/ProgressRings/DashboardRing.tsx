import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Path,
  Skia,
  SweepGradient,
  vec,
} from "@shopify/react-native-skia";
import {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";

import { AppText } from "@/components";
import { Colors, Theme, useTheme } from "@/theme";
import { Flame } from "lucide-react-native";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const TWO_PI = Math.PI * 2;

const hexToRgb = (hexColor: string) => {
  const hex = hexColor.replace("#", "");
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;
  const intVal = parseInt(normalized, 16);
  const r = (intVal >> 16) & 255;
  const g = (intVal >> 8) & 255;
  const b = intVal & 255;
  return { r, g, b };
};

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (value: number) => {
    const safe = Math.round(Math.max(0, Math.min(255, value)));
    return safe.toString(16).padStart(2, "0");
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const adjustColor = (hexColor: string, amount: number) => {
  const { r, g, b } = hexToRgb(hexColor);
  const scaleChannel = (value: number) => {
    if (amount >= 0) {
      return value + (255 - value) * amount;
    }
    return value * (1 + amount);
  };
  return rgbToHex(scaleChannel(r), scaleChannel(g), scaleChannel(b));
};

const interpolateColor = (from: string, to: string, t: number) => {
  const fromRgb = hexToRgb(from);
  const toRgb = hexToRgb(to);
  const mix = (a: number, b: number) => a + (b - a) * t;
  return rgbToHex(
    mix(fromRgb.r, toRgb.r),
    mix(fromRgb.g, toRgb.g),
    mix(fromRgb.b, toRgb.b)
  );
};

type GradientStop = { position: number; color: string };

const deriveStops = (
  baseColor: string,
  sweep: number,
  effectIntensity: number
): GradientStop[] => {
  const normalized = clamp01(sweep);
  const intensity = clamp01(effectIntensity);

  const darkBase = adjustColor(baseColor, -0.35);
  const lightBase = adjustColor(baseColor, 0.12);

  const midShade = baseColor;
  const startShade = interpolateColor(midShade, darkBase, intensity);
  const warmShade = interpolateColor(midShade, lightBase, intensity);
  const highlightShade = midShade;
  const tailShade = startShade;

  const highlightEnd = Math.max(normalized, 0);
  const highlightStart = Math.max(
    Math.min(highlightEnd - 0.12, highlightEnd),
    0
  );
  const warmPoint = Math.max(
    Math.min(highlightStart * 0.65, highlightStart),
    0
  );
  const finalPoint =
    normalized >= 0.999 ? 0.999 : Math.min(normalized + 0.015, 0.999);

  return [
    { position: 0, color: startShade },
    { position: warmPoint, color: midShade },
    { position: highlightStart, color: warmShade },
    { position: Math.max(highlightEnd - 0.001, 0), color: highlightShade },
    { position: finalPoint, color: highlightShade },
    { position: 0.999, color: tailShade },
    { position: 1, color: tailShade },
  ];
};

const colorAtOffset = (offset: number, stops: GradientStop[]) => {
  if (stops.length === 0) return "#FFFFFF";
  if (offset <= stops[0].position) {
    return stops[0].color;
  }
  for (let index = 0; index < stops.length - 1; index += 1) {
    const current = stops[index];
    const next = stops[index + 1];
    if (offset >= current.position && offset <= next.position) {
      const localT =
        (offset - current.position) /
        Math.max(next.position - current.position, 0.0001);
      return interpolateColor(current.color, next.color, clamp01(localT));
    }
  }
  return stops[stops.length - 1].color;
};

const stopsEqual = (a: GradientStop[], b: GradientStop[]) =>
  a.length === b.length &&
  a.every(
    (stop, index) =>
      stop.position === b[index]?.position && stop.color === b[index]?.color
  );

interface RingAnimationState {
  sweep: number;
  rotation: number;
  endX: number;
  endY: number;
  shadowX: number;
  shadowY: number;
  opacity: number;
  color: string;
  stops: GradientStop[];
}

const calculateRingState = (
  rawRatio: number,
  center: number,
  radius: number,
  strokeWidth: number,
  baseColor: string
): RingAnimationState => {
  const ratio = Math.max(rawRatio, 0);
  const capped = Math.min(ratio, 1);
  const sweepValue = ratio >= 1 ? 0.995 : capped;
  const angle = sweepValue * TWO_PI;
  const rotation = Math.max(ratio - 1, 0) * TWO_PI;
  const endX = center + radius * Math.cos(angle);
  const endY = center + radius * Math.sin(angle);
  const tangentAngle = angle + Math.PI / 2;
  const offsetDistance = strokeWidth * 0.55;
  const shadowX = endX + Math.cos(tangentAngle) * offsetDistance;
  const shadowY = endY + Math.sin(tangentAngle) * offsetDistance;
  const opacity = ratio > 0.002 ? 1 : 0;
  const effectIntensity = clamp01((sweepValue - 0.1) / 0.3);
  const stops = deriveStops(baseColor, sweepValue, effectIntensity);
  const color = colorAtOffset(sweepValue, stops);

  return {
    sweep: sweepValue,
    rotation,
    endX,
    endY,
    shadowX,
    shadowY,
    opacity: ratio > 0.002 ? effectIntensity : 0,
    color,
    stops,
  };
};

const ringStatesEqual = (a: RingAnimationState, b: RingAnimationState) =>
  a.sweep === b.sweep &&
  a.rotation === b.rotation &&
  a.endX === b.endX &&
  a.endY === b.endY &&
  a.shadowX === b.shadowX &&
  a.shadowY === b.shadowY &&
  a.opacity === b.opacity &&
  a.color === b.color &&
  stopsEqual(a.stops, b.stops);

interface BaseRingLayerProps {
  radius: number;
  strokeWidth: number;
  center: number;
  trackColor: string;
  baseColor: string;
  trackOpacity: number;
  shadowColor: string;
}

interface AnimatedRingLayerProps extends BaseRingLayerProps {
  progress: SharedValue<number>;
}

const RingVisual: React.FC<
  BaseRingLayerProps & { state: RingAnimationState }
> = ({
  state,
  radius,
  strokeWidth,
  center,
  trackColor,
  trackOpacity,
  shadowColor,
}) => {
  const path = useMemo(() => {
    const ring = Skia.Path.Make();
    ring.addCircle(center, center, radius);
    return ring;
  }, [center, radius]);

  const centerVector = useMemo(() => vec(center, center), [center]);
  const gradientColors = useMemo(
    () => state.stops.map((stop) => stop.color),
    [state.stops]
  );
  const gradientPositions = useMemo(
    () => state.stops.map((stop) => stop.position),
    [state.stops]
  );

  return (
    <>
      <Path
        path={path}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
        color={trackColor}
        opacity={trackOpacity}
      />
      <Group origin={centerVector} transform={[{ rotate: state.rotation }]}>
        <Circle
          cx={state.shadowX}
          cy={state.shadowY}
          r={strokeWidth * 0.75}
          color={shadowColor}
          opacity={state.opacity * 0.75}
        >
          <BlurMask blur={strokeWidth * 1.2} style="normal" />
        </Circle>
        <Path
          path={path}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          start={0}
          end={state.sweep}
        >
          <SweepGradient
            c={centerVector}
            colors={gradientColors}
            positions={gradientPositions}
          />
        </Path>
        <Circle
          cx={state.endX}
          cy={state.endY}
          r={strokeWidth / 2}
          color={state.color}
          opacity={state.opacity}
        />
      </Group>
    </>
  );
};

const AnimatedRingLayer: React.FC<AnimatedRingLayerProps> = ({
  progress,
  ...baseProps
}) => {
  const [state, setState] = useState(() =>
    calculateRingState(
      progress.value,
      baseProps.center,
      baseProps.radius,
      baseProps.strokeWidth,
      baseProps.baseColor
    )
  );

  const updateFromRatio = useCallback(
    (value: number) => {
      const nextState = calculateRingState(
        value,
        baseProps.center,
        baseProps.radius,
        baseProps.strokeWidth,
        baseProps.baseColor
      );
      setState((prev) => (ringStatesEqual(prev, nextState) ? prev : nextState));
    },
    [
      baseProps.center,
      baseProps.radius,
      baseProps.strokeWidth,
      baseProps.baseColor,
    ]
  );

  useEffect(() => {
    updateFromRatio(progress.value);
  }, [progress, updateFromRatio]);

  useAnimatedReaction(
    () => progress.value,
    (value) => {
      runOnJS(updateFromRatio)(value);
    },
    [updateFromRatio]
  );

  return <RingVisual state={state} {...baseProps} />;
};

interface DashboardRingProps {
  percentage?: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor?: string;
  textColor?: string;
  label?: string;
  displayValue: string | number;
  displayUnit?: string;
  detailValue?: string | number;
  detailUnit?: string;
  showDetail?: boolean;
  animationDelay?: number;
  skipAnimation?: boolean;
  testID?: string;
  Icon?: React.ComponentType<{ size: number; color: string; fill: string }>;
}

export const DashboardRing: React.FC<DashboardRingProps> = ({
  percentage = 0,
  size = 176,
  strokeWidth = 16,
  color,
  trackColor,
  textColor,
  label: _label,
  displayValue,
  displayUnit: _displayUnit,
  detailValue,
  detailUnit: _detailUnit,
  showDetail: _showDetail = false,
  animationDelay = 0,
  skipAnimation = false,
  testID,
  Icon = Flame,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const progress = useSharedValue(0);
  const ratio = Math.max(0, (percentage ?? 0) / 100);

  // Animated values for tip icon position and rotation
  const tipX = useSharedValue(0);
  const tipY = useSharedValue(0);
  const tipOpacity = useSharedValue(0);
  const tipRotation = useSharedValue(0);

  useEffect(() => {
    if (skipAnimation) {
      // Skip animation: set value instantly
      progress.value = ratio;
    } else {
      // Animate with delay and spring
      progress.value = withDelay(
        animationDelay,
        withSpring(ratio, {
          mass: 1.2,
          damping: 25,
          stiffness: 80,
        })
      );
    }
  }, [animationDelay, ratio, progress, skipAnimation]);

  const center = size / 2;
  const gapSize = 4;
  const radius = center - strokeWidth / 2 - gapSize;
  const resolvedTrackColor =
    trackColor ?? adjustColor(color, isDark ? -0.55 : -0.4);
  const shadowColor = isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.32)";

  // Calculate tip position with rotation transforms
  useAnimatedReaction(
    () => progress.value,
    (currentProgress) => {
      const progressRatio = Math.max(currentProgress, 0);
      const capped = Math.min(progressRatio, 1);
      const sweepValue = progressRatio >= 1 ? 0.995 : capped;

      // Calculate angle (same as in calculateRingState)
      const angle = sweepValue * TWO_PI;
      const rotation = Math.max(progressRatio - 1, 0) * TWO_PI;

      // Apply the same transforms as the Skia Group
      // Base rotation: -Math.PI / 2 (ring starts at top)
      // Plus internal rotation from the ring animation
      const finalAngle = angle - Math.PI / 2 + rotation;

      // Calculate final screen position
      const finalX = center + radius * Math.cos(finalAngle);
      const finalY = center + radius * Math.sin(finalAngle);

      tipX.value = finalX;
      tipY.value = finalY;
      tipOpacity.value = progressRatio > 0.002 ? 1 : 0;
      tipRotation.value = finalAngle;
    },
    [center, radius]
  );

  const styles = useMemo(() => createStyles(size, theme), [size, theme]);

  const iconSize = strokeWidth * 0.75;
  const tipIconStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: tipX.value - iconSize / 2,
    top: tipY.value - iconSize / 2,
    opacity: tipOpacity.value,
    transform: [{ rotate: `${tipRotation.value}rad` }],
  }));

  return (
    <View style={styles.wrapper} testID={testID}>
      <View style={styles.canvasContainer}>
        <Canvas style={{ width: size, height: size }}>
          <Group
            origin={vec(center, center)}
            transform={[{ rotate: -Math.PI / 2 }]}
          >
            <AnimatedRingLayer
              progress={progress}
              radius={radius}
              strokeWidth={strokeWidth}
              center={center}
              trackColor={resolvedTrackColor}
              baseColor={color}
              trackOpacity={1}
              shadowColor={shadowColor}
            />
          </Group>
        </Canvas>
        <Animated.View style={tipIconStyle} pointerEvents="none">
          <Icon
            size={iconSize}
            color={resolvedTrackColor}
            fill={"transparent"}
            strokeWidth={2.5}
          />
        </Animated.View>
        <View style={styles.valueContainer} pointerEvents="none">
          <View style={styles.textLayer}>
            <AppText
              role="Title1"
              style={textColor && { color: textColor }}
            >{`${displayValue}`}</AppText>
            {detailValue ? (
              <AppText
                role="Caption"
                style={[styles.remaining, { color: textColor }]}
              >
                {detailValue}
              </AppText>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

const createStyles = (size: number, theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      alignItems: "center",
      justifyContent: "center",
      width: size,
    },
    canvasContainer: {
      width: size,
      height: size,
      alignItems: "center",
      justifyContent: "center",
    },
    valueContainer: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    remaining: {
      marginTop: -theme.spacing.xs,
    },
    textLayer: {
      alignItems: "center",
      justifyContent: "center",
    },
  });
