import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { AppText } from "@/components/shared/AppText";

interface TooltipProps {
  text: string;
  children: React.ReactElement;
}

interface TriggerFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

const SCREEN_MARGIN = 12;
const CARET_HEIGHT = 8;
const CARET_WIDTH = 16;
const CORNER_RADIUS = 14;
const PADDING_HORIZONTAL = 16;
const PADDING_VERTICAL = 12;
const SPRING_CONFIG = {
  damping: 18,
  mass: 0.45,
  stiffness: 190,
};
const CARET_GAP = 4;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const child = React.Children.only(children);
  const triggerRef = useRef<View>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [triggerFrame, setTriggerFrame] = useState<TriggerFrame | null>(null);
  const [contentSize, setContentSize] = useState<{ width: number; height: number } | null>(
    null
  );

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  useEffect(() => {
    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, []);

  const closeTooltip = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    setIsVisible(false);

    hideTimeout.current = setTimeout(() => {
      setShouldRender(false);
      setTriggerFrame(null);
    }, 180);
  }, []);

  const handleToggle = useCallback(() => {
    if (isVisible) {
      closeTooltip();
      return;
    }

    if (!triggerRef.current) {
      return;
    }

    triggerRef.current.measureInWindow((x, y, width, height) => {
      setTriggerFrame({ x, y, width, height });
      setShouldRender(true);
      setIsVisible(true);
    });
  }, [closeTooltip, isVisible]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    if (isVisible) {
      // Spring in with a slight scale-up to mimic iOS popovers.
      scale.value = withSpring(1, SPRING_CONFIG);
      opacity.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.ease) });
    } else {
      // Fade and scale down before unmounting.
      scale.value = withTiming(0.95, { duration: 120, easing: Easing.in(Easing.ease) });
      opacity.value = withTiming(0, { duration: 120, easing: Easing.in(Easing.ease) });
    }
  }, [isVisible, opacity, scale, shouldRender]);

  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContentSize((prev) => {
      if (!prev || prev.width !== width || prev.height !== height) {
        return { width, height };
      }
      return prev;
    });
  }, []);

  const tooltipGeometry = useMemo(() => {
    if (!triggerFrame || !contentSize) {
      return null;
    }

    const maxWidth = windowWidth - SCREEN_MARGIN * 2;
    const bodyWidth = Math.min(contentSize.width, maxWidth);
    const bodyHeight = contentSize.height;

    const totalHeight = bodyHeight + CARET_HEIGHT;

    const triggerCenterX = triggerFrame.x + triggerFrame.width / 2;

    // Decide whether to show above or below the trigger based on available space.
    const anchorY = triggerFrame.y + triggerFrame.height / 2;

    const spaceAbove = anchorY - SCREEN_MARGIN;
    const spaceBelow = windowHeight - anchorY - SCREEN_MARGIN;
    const shouldDisplayAbove = spaceBelow < totalHeight && spaceAbove > spaceBelow;

    let top: number;
    let caretDirection: "up" | "down";
    if (shouldDisplayAbove) {
      caretDirection = "down";
      const caretTipTargetY = anchorY - CARET_GAP;
      top = Math.max(SCREEN_MARGIN, caretTipTargetY - totalHeight);
    } else {
      caretDirection = "up";
      const caretTipTargetY = anchorY + CARET_GAP;
      top = Math.min(
        windowHeight - totalHeight - SCREEN_MARGIN,
        caretTipTargetY - CARET_HEIGHT
      );
    }

    let left = triggerCenterX - bodyWidth / 2;
    left = clamp(left, SCREEN_MARGIN, windowWidth - bodyWidth - SCREEN_MARGIN);

    const caretOffsetRaw = triggerCenterX - left;
    const caretOffset = clamp(
      caretOffsetRaw,
      CORNER_RADIUS + CARET_WIDTH / 2,
      bodyWidth - CORNER_RADIUS - CARET_WIDTH / 2
    );

    return {
      top,
      left,
      width: bodyWidth,
      bodyHeight,
      totalHeight,
      caretOffset,
      caretDirection,
    };
  }, [contentSize, triggerFrame, windowHeight, windowWidth]);

  const tooltipPath = useMemo(() => {
    if (!tooltipGeometry) {
      return null;
    }

    const {
      width,
      bodyHeight,
      caretOffset,
      caretDirection,
    } = tooltipGeometry;

    const path = Skia.Path.Make();

    if (caretDirection === "down") {
      // Tooltip renders above the trigger, so caret points downward from the bottom edge.
      path.moveTo(CORNER_RADIUS, 0);
      path.lineTo(width - CORNER_RADIUS, 0);
      path.quadTo(width, 0, width, CORNER_RADIUS);
      path.lineTo(width, bodyHeight - CORNER_RADIUS);
      path.quadTo(width, bodyHeight, width - CORNER_RADIUS, bodyHeight);
      path.lineTo(caretOffset + CARET_WIDTH / 2, bodyHeight);
      path.lineTo(caretOffset, bodyHeight + CARET_HEIGHT);
      path.lineTo(caretOffset - CARET_WIDTH / 2, bodyHeight);
      path.lineTo(CORNER_RADIUS, bodyHeight);
      path.quadTo(0, bodyHeight, 0, bodyHeight - CORNER_RADIUS);
      path.lineTo(0, CORNER_RADIUS);
      path.quadTo(0, 0, CORNER_RADIUS, 0);
    } else {
      // Tooltip renders below the trigger, so caret sits on the top edge pointing upward.
      const bodyTop = CARET_HEIGHT;
      const bodyBottom = CARET_HEIGHT + bodyHeight;

      path.moveTo(CORNER_RADIUS, bodyTop);
      path.lineTo(caretOffset - CARET_WIDTH / 2, bodyTop);
      path.lineTo(caretOffset, 0);
      path.lineTo(caretOffset + CARET_WIDTH / 2, bodyTop);
      path.lineTo(width - CORNER_RADIUS, bodyTop);
      path.quadTo(width, bodyTop, width, bodyTop + CORNER_RADIUS);
      path.lineTo(width, bodyBottom - CORNER_RADIUS);
      path.quadTo(width, bodyBottom, width - CORNER_RADIUS, bodyBottom);
      path.lineTo(CORNER_RADIUS, bodyBottom);
      path.quadTo(0, bodyBottom, 0, bodyBottom - CORNER_RADIUS);
      path.lineTo(0, bodyTop + CORNER_RADIUS);
      path.quadTo(0, bodyTop, CORNER_RADIUS, bodyTop);
    }

    path.close();
    return path;
  }, [tooltipGeometry]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const contentPositionStyle = useMemo(() => {
    if (!tooltipGeometry) {
      return null;
    }

    return tooltipGeometry.caretDirection === "up"
      ? {
          top: CARET_HEIGHT,
          bottom: 0,
        }
      : {
          top: 0,
          bottom: CARET_HEIGHT,
        };
  }, [tooltipGeometry]);

  return (
    <View ref={triggerRef} collapsable={false}>
      <Pressable onPress={handleToggle} hitSlop={8}>
        {child}
      </Pressable>

      {shouldRender && (
        <Modal
          animationType="none"
          transparent
          statusBarTranslucent
          visible
          onRequestClose={closeTooltip}
        >
          <Pressable
            pointerEvents="box-only"
            style={StyleSheet.absoluteFill}
            onPress={closeTooltip}
          />

          {tooltipGeometry && tooltipPath ? (
            <Animated.View
              pointerEvents="box-none"
              style={[
                styles.tooltipWrapper,
                { top: tooltipGeometry.top, left: tooltipGeometry.left },
                animatedStyle,
              ]}
            >
              <View
                style={{
                  width: tooltipGeometry.width,
                  height: tooltipGeometry.totalHeight,
                }}
              >
                <MaskedView
                  style={StyleSheet.absoluteFill}
                  maskElement={
                    <Canvas
                      style={{
                        width: tooltipGeometry.width,
                        height: tooltipGeometry.totalHeight,
                      }}
                    >
                      <Path path={tooltipPath} color="white" />
                    </Canvas>
                  }
                >
                  {/* BlurView lends the frosted glass effect expected from native popovers. */}
                  <BlurView tint="dark" intensity={50} style={StyleSheet.absoluteFill} />
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      { backgroundColor: "rgba(15, 15, 15, 0.6)" },
                    ]}
                  />
                </MaskedView>

                <View
                  onLayout={handleContentLayout}
                  style={[
                    styles.content,
                    { maxWidth: windowWidth - SCREEN_MARGIN * 2 },
                    contentPositionStyle ?? undefined,
                  ]}
                >
                  <AppText role="Subhead" color="white" style={styles.text}>
                    {text}
                  </AppText>
                </View>
              </View>
            </Animated.View>
          ) : (
            // Render once off-screen so we can measure the content size before positioning.
            <View style={styles.measureContainer} pointerEvents="none">
              <View
                onLayout={handleContentLayout}
                style={[
                  styles.content,
                  { maxWidth: windowWidth - SCREEN_MARGIN * 2 },
                ]}
              >
                <AppText role="Subhead" color="white" style={styles.text}>
                  {text}
                </AppText>
              </View>
            </View>
          )}
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tooltipWrapper: {
    position: "absolute",
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  content: {
    position: "absolute",
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingVertical: PADDING_VERTICAL,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  text: {
    lineHeight: 18,
  },
  measureContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
});

export default Tooltip;
