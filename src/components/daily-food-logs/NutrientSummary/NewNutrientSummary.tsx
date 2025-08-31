// NutrientRings.tsx
import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Canvas, Group, Path, Skia, vec } from "@shopify/react-native-skia";
import {
  useSharedValue,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";

type NutrientValues = {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

export interface NutrientSummaryProps {
  percentages: NutrientValues; // accepts either 0..1 or 0..100; component will normalize
  targets: NutrientValues;
  totals: NutrientValues;
  /** size in points (component will render a square). If omitted defaults to 220 */
  size?: number;
}

/**
 * Helper: normalize incoming percentage (accept 0..1 or 0..100)
 */
const normalize = (v?: number) => {
  if (v == null || Number.isNaN(v)) return 0;
  if (v > 1) return Math.min(1, v / 100);
  return Math.max(0, Math.min(1, v));
};

const COLORS = {
  calories: "#2DCEC4",
  protein: "#4F86F7",
  carbs: "#FF6B6B",
  fat: "#FFC107",
};

const GRAY = "#E6E9EB"; // subtle gray background for each ring
const SPACING = 2; // 2pt spacing between rings

export const NutrientRings: React.FC<NutrientSummaryProps> = ({
  percentages,
  targets,
  totals,
  size = 220,
}) => {
  // Radii and stroke widths scale with size.
  // We'll compute 4 rings from outer to inner:
  // calories (outer), protein, carbs, fat (inner)
  const center = size / 2;

  // Each ring gets base stroke that grows with size (bigger size -> wider stroke)
  const baseStroke = Math.max(6, Math.round(size * 0.06)); // 6pt minimum
  // We'll reduce stroke progressively if many rings but keep spacing constant.
  // compute total available radial thickness (from outermost center to innermost)
  const totalThickness = Math.min(size / 2 - 8, baseStroke * 4 + SPACING * 3);
  // if there's lots of space, expand stroke proportionally:
  const strokeScale = size / 220;

  const strokeWidths = [
    Math.round(baseStroke * strokeScale), // calories (outer)
    Math.round(baseStroke * 0.95 * strokeScale), // protein
    Math.round(baseStroke * 0.9 * strokeScale), // carbs
    Math.round(baseStroke * 0.85 * strokeScale), // fat
  ];

  // radii: start from outermost ring radius = center - padding
  const padding = 8;
  // Keep spacing between rings as SPACING
  const radii = useMemo(() => {
    const outer = center - padding - strokeWidths[0] / 2;
    const r1 = outer;
    const r2 = r1 - (strokeWidths[0] + SPACING);
    const r3 = r2 - (strokeWidths[1] + SPACING);
    const r4 = r3 - (strokeWidths[2] + SPACING);
    return [r1, r2, r3, r4];
  }, [center, strokeWidths]);

  // normalize input percentages (support 0..1 or 0..100)
  const normalized = {
    calories: normalize(percentages.calories),
    protein: normalize(percentages.protein),
    carbs: normalize(percentages.carbs),
    fat: normalize(percentages.fat),
  };

  // Reanimated shared values (we animate from previous to new).
  const caloriesVal = useSharedValue(normalized.calories);
  const proteinVal = useSharedValue(normalized.protein);
  const carbsVal = useSharedValue(normalized.carbs);
  const fatVal = useSharedValue(normalized.fat);

  // Update shared values when props change, using springs for satisfying motion.
  useEffect(() => {
    // tune spring config to be "satisfying"
    const springConfig = { damping: 20, stiffness: 180, mass: 0.8 };
    caloriesVal.value = withSpring(normalized.calories, springConfig);
    proteinVal.value = withSpring(normalized.protein, springConfig);
    carbsVal.value = withSpring(normalized.carbs, springConfig);
    fatVal.value = withSpring(normalized.fat, springConfig);
  }, [
    normalized.calories,
    normalized.protein,
    normalized.carbs,
    normalized.fat,
  ]);

  // Derive values (these are reanimated derived values and can be passed directly to Skia).
  // IMPORTANT: Skia accepts Reanimated shared/derived values directly per docs.
  const calEnd = useDerivedValue(() => caloriesVal.value);
  const proEnd = useDerivedValue(() => proteinVal.value);
  const carbEnd = useDerivedValue(() => carbsVal.value);
  const fatEnd = useDerivedValue(() => fatVal.value);

  /**
   * Build a circular SVG-style path string centered at (cx,cy) with radius r.
   * The path below is the standard "two arc" circle path that Skia understands:
   * M cx cy
   * m -r, 0
   * a r,r 0 1,0 (2r),0
   * a r,r 0 1,0 -(2r),0
   *
   * We'll rotate the whole group by -90deg (via transform) so 0% starts at 12 o'clock.
   */
  const circlePath = (cx: number, cy: number, r: number) =>
    `M ${cx} ${cy} m -${r} 0 a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 -${
      2 * r
    } 0`;

  // Precompute paths (strings) for each ring
  const paths = useMemo(() => {
    return radii.map((r) => circlePath(center, center, Math.max(2, r)));
  }, [radii, center]);

  // center text (totals) - basic formatting
  const totalCals = totals.calories ?? 0;
  const totalProtein = totals.protein ?? 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas style={{ width: size, height: size }}>
        {/* Rotate group -90deg so start is at top */}
        <Group
          origin={vec(center, center)}
          transform={[{ rotate: -Math.PI / 2 }]}
        >
          {/* Draw rings from outer -> inner */}
          {/* 0: calories (outer) */}
          <Path
            path={paths[0]}
            color={GRAY}
            style="stroke"
            strokeWidth={strokeWidths[0]}
            strokeJoin="round"
            strokeCap="round"
            start={0}
            end={1}
          />
          <Path
            path={paths[0]}
            color={COLORS.calories}
            style="stroke"
            strokeWidth={strokeWidths[0]}
            strokeJoin="round"
            strokeCap="round"
            start={0}
            // pass Reanimated derived value (0..1) to Skia end prop
            end={calEnd}
          />

          {/* 1: protein */}
          <Path
            path={paths[1]}
            color={GRAY}
            style="stroke"
            strokeWidth={strokeWidths[1]}
            strokeJoin="round"
            strokeCap="round"
            start={0}
            end={1}
          />
          <Path
            path={paths[1]}
            color={COLORS.protein}
            style="stroke"
            strokeWidth={strokeWidths[1]}
            strokeJoin="round"
            strokeCap="round"
            start={0}
            end={proEnd}
          />

          {/* 2: carbs */}
          <Path
            path={paths[2]}
            color={GRAY}
            style="stroke"
            strokeWidth={strokeWidths[2]}
            strokeJoin="round"
            strokeCap="round"
            start={0}
            end={1}
          />
          <Path
            path={paths[2]}
            color={COLORS.carbs}
            style="stroke"
            strokeWidth={strokeWidths[2]}
            strokeJoin="round"
            strokeCap="round"
            start={0}
            end={carbEnd}
          />

          {/* 3: fat */}
          <Path
            path={paths[3]}
            color={GRAY}
            style="stroke"
            strokeWidth={strokeWidths[3]}
            strokeJoin="round"
            strokeCap="round"
            start={0}
            end={1}
          />
          <Path
            path={paths[3]}
            color={COLORS.fat}
            style="stroke"
            strokeWidth={strokeWidths[3]}
            strokeJoin="round"
            strokeCap="round"
            start={0}
            end={fatEnd}
          />
        </Group>
      </Canvas>

      {/* Overlay center content (totals / small legend). This is a normal RN view placed on top */}
      <View style={[styles.centerOverlay, { width: size, height: size }]}>
        <Text style={[styles.calText]}>{Math.round(totalCals)} kcal</Text>
        <Text style={[styles.subText]}>
          {Math.round(totalProtein)} g protein
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    // center box is slightly smaller than canvas so it doesn't overlap strokes
    padding: 6,
  },
  calText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  subText: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },
});
export default NutrientRings;
