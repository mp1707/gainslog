import { memo, useEffect } from 'react';
import { Canvas, Path, SkPath, Skia } from '@shopify/react-native-skia';
import {
  Easing,
  cancelAnimation,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface MacroLineLoaderProps {
  color: string;
  index: number;
  width: number;
  height: number;
  squiggleDensity?: number;
  detailDensity?: number;
  amplitudeScale?: number;
}

const MacroLineLoaderComponent = ({
  color,
  index,
  width,
  height,
  squiggleDensity = 1,
  detailDensity,
  amplitudeScale = 1,
}: MacroLineLoaderProps) => {
  const progress = useSharedValue(0);
  const sway = useSharedValue(0);

  const widthValue = useSharedValue(width);
  const heightValue = useSharedValue(height);
  const densityValue = useSharedValue(Math.max(0.35, squiggleDensity));
  const detailDensityValue = useSharedValue(
    detailDensity !== undefined
      ? Math.max(0.35, detailDensity)
      : Math.max(0.5, squiggleDensity * 1.2),
  );
  const amplitudeValue = useSharedValue(Math.max(0.35, amplitudeScale));

  useEffect(() => {
    const densityFactor = Math.max(0.35, squiggleDensity);
    const speedMultiplier = Math.sqrt(densityFactor);
    const duration = (2600 + index * 320) / speedMultiplier;
    const swayDuration = (1900 + index * 180) / Math.max(0.6, speedMultiplier * 0.88);

    progress.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    sway.value = withRepeat(
      withTiming(1, {
        duration: swayDuration,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(progress);
      cancelAnimation(sway);
    };
  }, [index, progress, squiggleDensity, sway]);

  useEffect(() => {
    widthValue.value = width;
    heightValue.value = height;
  }, [width, height, widthValue, heightValue]);

  useEffect(() => {
    densityValue.value = Math.max(0.35, squiggleDensity);
  }, [densityValue, squiggleDensity]);

  useEffect(() => {
    detailDensityValue.value =
      detailDensity !== undefined
        ? Math.max(0.35, detailDensity)
        : Math.max(0.5, squiggleDensity * 1.2);
  }, [detailDensity, detailDensityValue, squiggleDensity]);

  useEffect(() => {
    amplitudeValue.value = Math.max(0.35, amplitudeScale);
  }, [amplitudeScale, amplitudeValue]);

  const path = useDerivedValue<SkPath>(() => {
    'worklet';
    const canvasWidth = widthValue.value;
    const canvasHeight = heightValue.value;
    const densityFactor = densityValue.value;
    const detailFactor = detailDensityValue.value;
    const amplitudeFactor = amplitudeValue.value;
    const pathInstance = Skia.Path.Make();

    if (canvasWidth <= 0 || canvasHeight <= 0) {
      return pathInstance;
    }

    const strokeWidth = Math.max(1.75, canvasHeight * 0.16);
    const horizontalInset = Math.min(canvasWidth / 6, strokeWidth);
    const usableWidth = Math.max(0, canvasWidth - horizontalInset * 2);
    const baseY = canvasHeight / 2;
    const segments = Math.max(
      24,
      Math.round(Math.max(usableWidth, 1) / Math.max(2, 8 / Math.max(0.4, densityFactor))),
    );
    const baseAmplitude = canvasHeight * 0.28;
    const dynamicAmplitude = baseAmplitude * amplitudeFactor;
    const swayPhase = sway.value * Math.PI * 2;
    const basePhase = progress.value;
    const mainFrequency = (6.4 + index * 0.75) * Math.max(0.5, densityFactor);
    const detailFrequency = (10.6 + index * 1.35) * Math.max(0.5, detailFactor);
    const primaryOffset = index * 0.48;

    pathInstance.moveTo(horizontalInset, baseY);

    for (let i = 1; i <= segments; i += 1) {
      const t = i / segments;
      const x = horizontalInset + t * usableWidth;

      const envelope = Math.sin(Math.PI * t);
      const mainWave = Math.sin(basePhase + primaryOffset + t * mainFrequency);
      const detailWave = Math.sin(
        basePhase * 2 + swayPhase + index * 1.3 + t * detailFrequency,
      );

      const amplitudeVariation =
        dynamicAmplitude * (0.75 + 0.35 * Math.sin(swayPhase + index));
      const y =
        baseY +
        envelope * amplitudeVariation * 0.65 * mainWave +
        envelope * dynamicAmplitude * 0.35 * detailWave;

      const verticalInset = strokeWidth * 0.8;
      const clampedY = Math.min(
        Math.max(y, verticalInset),
        canvasHeight - verticalInset,
      );
      pathInstance.lineTo(x, clampedY);
    }

    return pathInstance;
  }, [index]);

  return (
    <Canvas style={{ width, height }}>
      <Path
        path={path}
        color={color}
        style="stroke"
        strokeWidth={Math.max(1.75, height * 0.16)}
        strokeCap="round"
        strokeJoin="round"
        opacity={0.92}
      />
    </Canvas>
  );
};

export const MacroLineLoader = memo(MacroLineLoaderComponent);
