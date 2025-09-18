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
}

const MacroLineLoaderComponent = ({
  color,
  index,
  width,
  height,
}: MacroLineLoaderProps) => {
  const progress = useSharedValue(0);
  const sway = useSharedValue(0);

  const widthValue = useSharedValue(width);
  const heightValue = useSharedValue(height);

  useEffect(() => {
    const duration = 2600 + index * 320;
    const swayDuration = 1900 + index * 180;

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
  }, [index, progress, sway]);

  useEffect(() => {
    widthValue.value = width;
    heightValue.value = height;
  }, [width, height, widthValue, heightValue]);

  const path = useDerivedValue<SkPath>(() => {
    'worklet';
    const canvasWidth = widthValue.value;
    const canvasHeight = heightValue.value;
    const pathInstance = Skia.Path.Make();

    if (canvasWidth <= 0 || canvasHeight <= 0) {
      return pathInstance;
    }

    const strokeWidth = Math.max(1.75, canvasHeight * 0.16);
    const horizontalInset = Math.min(canvasWidth / 6, strokeWidth);
    const usableWidth = Math.max(0, canvasWidth - horizontalInset * 2);
    const baseY = canvasHeight / 2;
    const segments = Math.max(24, Math.round(Math.max(usableWidth, 1) / 8));
    const baseAmplitude = canvasHeight * 0.28;
    const swayPhase = sway.value * Math.PI * 2;
    const basePhase = progress.value;
    const mainFrequency = 6.4 + index * 0.75;
    const detailFrequency = 10.6 + index * 1.35;
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
        baseAmplitude * (0.75 + 0.35 * Math.sin(swayPhase + index));
      const y =
        baseY +
        envelope * amplitudeVariation * 0.65 * mainWave +
        envelope * baseAmplitude * 0.35 * detailWave;

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
