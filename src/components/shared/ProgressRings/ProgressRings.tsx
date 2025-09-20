import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
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
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/theme";

interface NutrientValues {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface ProgressRingsAppleProps {
  percentages: NutrientValues;
  size?: number;
  strokeWidth?: number;
  spacing?: number;
  padding?: number;
}

type NutrientKey = keyof NutrientValues;

const RING_CONFIG: ReadonlyArray<{
  key: NutrientKey;
  colorKey: NutrientKey;
  label: string;
}> = [
  { key: "calories", colorKey: "calories", label: "Calories" },
  { key: "protein", colorKey: "protein", label: "Protein" },
  { key: "carbs", colorKey: "carbs", label: "Carbs" },
  { key: "fat", colorKey: "fat", label: "Fat" },
] as const;

type GradientStop = { position: number; color: string };

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

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

const buildGradientStops = (baseColor: string): GradientStop[] => [
  { position: 0, color: adjustColor(baseColor, -0.35) },
  { position: 0.55, color: baseColor },
  { position: 0.88, color: adjustColor(baseColor, 0.2) },
  { position: 0.97, color: adjustColor(baseColor, 0.4) },
  { position: 1, color: adjustColor(baseColor, -0.35) },
];

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

interface RingLayerProps {
  progress: SharedValue<number>;
  radius: number;
  strokeWidth: number;
  center: number;
  trackColor: string;
  baseColor: string;
  trackOpacity: number;
  shadowColor: string;
}

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

const RingLayer = ({
  progress,
  radius,
  strokeWidth,
  center,
  trackColor,
  baseColor,
  trackOpacity,
  shadowColor,
}: RingLayerProps) => {
  const path = useMemo(() => {
    const ring = Skia.Path.Make();
    ring.addCircle(center, center, radius);
    return ring;
  }, [center, radius]);

  const [animationState, setAnimationState] = useState<RingAnimationState>(
    () => ({
      sweep: 0,
      rotation: 0,
      endX: center + radius,
      endY: center,
      shadowX: center + radius,
      shadowY: center,
      opacity: 0,
      color: baseColor,
      stops: buildGradientStops(baseColor),
    })
  );

  const centerVector = useMemo(() => vec(center, center), [center]);

  const gradientColors = useMemo(
    () => animationState.stops.map((stop) => stop.color),
    [animationState.stops]
  );
  const gradientPositions = useMemo(
    () => animationState.stops.map((stop) => stop.position),
    [animationState.stops]
  );

  const deriveStops = useCallback(
    (sweep: number) => {
      const normalized = clamp01(sweep);
      const startShade = adjustColor(baseColor, -0.35);
      const midShade = baseColor;
      const warmShade = adjustColor(baseColor, 0.12);
      const highlightShade = adjustColor(baseColor, 0.4);
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
    },
    [baseColor]
  );

  const updateFromRatio = useCallback(
    (rawRatio: number) => {
      const ratio = Math.max(rawRatio, 0);
      const capped = Math.min(ratio, 1);
      const sweepValue = ratio >= 1 ? 0.995 : capped;
      const fullTurns = Math.max(ratio - 1, 0) * Math.PI * 2;
      const angle = sweepValue * Math.PI * 2;
      const capX = center + radius * Math.cos(angle);
      const capY = center + radius * Math.sin(angle);
      const tangentAngle = angle + Math.PI / 2;
      const offsetDistance = strokeWidth * 0.55;
      const shadowX = capX + Math.cos(tangentAngle) * offsetDistance;
      const shadowY = capY + Math.sin(tangentAngle) * offsetDistance;
      const opacity = ratio > 0.002 ? 1 : 0;
      const stops = deriveStops(sweepValue);
      const color = colorAtOffset(sweepValue, stops);

      setAnimationState((prev) => {
        const sameStops = stopsEqual(prev.stops, stops);
        if (
          prev.sweep === sweepValue &&
          prev.rotation === fullTurns &&
          prev.endX === capX &&
          prev.endY === capY &&
          prev.shadowX === shadowX &&
          prev.shadowY === shadowY &&
          prev.opacity === opacity &&
          prev.color === color &&
          sameStops
        ) {
          return prev;
        }
        return {
          sweep: sweepValue,
          rotation: fullTurns,
          endX: capX,
          endY: capY,
          shadowX,
          shadowY,
          opacity,
          color,
          stops,
        };
      });
    },
    [center, deriveStops, radius, strokeWidth]
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
      <Group
        origin={centerVector}
        transform={[{ rotate: animationState.rotation }]}
      >
        <Circle
          cx={animationState.shadowX}
          cy={animationState.shadowY}
          r={strokeWidth * 0.75}
          color={shadowColor}
          opacity={animationState.opacity * 0.75}
        >
          <BlurMask blur={strokeWidth * 1.2} style="normal" />
        </Circle>
        <Path
          path={path}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          start={0}
          end={animationState.sweep}
        >
          <SweepGradient
            c={centerVector}
            colors={gradientColors}
            positions={gradientPositions}
          />
        </Path>
        <Circle
          cx={animationState.endX}
          cy={animationState.endY}
          r={strokeWidth / 2}
          color={animationState.color}
          opacity={animationState.opacity}
        />
      </Group>
    </>
  );
};

export const ProgressRings: React.FC<ProgressRingsAppleProps> = ({
  percentages,
  size = 176,
  strokeWidth = 16,
  spacing = 8,
  padding = 8,
}) => {
  const { colors, colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  const caloriesProgress = useSharedValue(0);
  const proteinProgress = useSharedValue(0);
  const carbsProgress = useSharedValue(0);
  const fatProgress = useSharedValue(0);

  const progressValues: Record<NutrientKey, SharedValue<number>> = useMemo(
    () => ({
      calories: caloriesProgress,
      protein: proteinProgress,
      carbs: carbsProgress,
      fat: fatProgress,
    }),
    [caloriesProgress, proteinProgress, carbsProgress, fatProgress]
  );

  useEffect(() => {
    RING_CONFIG.forEach((config, index) => {
      const raw = percentages[config.key] ?? 0;
      const normalized = Math.max(0, raw / 100);
      const delay = index * 120;
      progressValues[config.key].value = withDelay(
        delay,
        withSpring(normalized, {
          mass: 0.6,
          damping: 15,
          stiffness: 120,
        })
      );
    });
  }, [percentages, progressValues]);

  const center = size / 2;
  const outerRadius = center - strokeWidth / 2 - padding;
  const radii = useMemo(() => {
    const values: number[] = [];
    let current = outerRadius;
    for (let index = 0; index < RING_CONFIG.length; index += 1) {
      values.push(current);
      if (index < RING_CONFIG.length - 1) {
        current -= strokeWidth + spacing;
      }
    }
    return values;
  }, [outerRadius, spacing, strokeWidth]);

  const ringColors = {
    calories: colors.semantic.calories,
    protein: colors.semantic.protein,
    carbs: colors.semantic.carbs,
    fat: colors.semantic.fat,
  } satisfies Record<NutrientKey, string>;

  const trackColor = colors.disabledBackground;
  const shadowColor = isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.32)";

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Canvas style={{ width: size, height: size }}>
        <Group
          origin={vec(center, center)}
          transform={[{ rotate: -Math.PI / 2 }]}
        >
          {RING_CONFIG.map((config, index) => (
            <RingLayer
              key={config.key}
              progress={progressValues[config.key]}
              radius={radii[index] ?? outerRadius}
              strokeWidth={strokeWidth}
              center={center}
              trackColor={trackColor}
              baseColor={ringColors[config.key]}
              trackOpacity={isDark ? 0.35 : 0.22}
              shadowColor={shadowColor}
            />
          ))}
        </Group>
      </Canvas>
    </View>
  );
};
