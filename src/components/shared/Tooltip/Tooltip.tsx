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
const TOOLTIP_SPACING = 8;
const CORNER_RADIUS = 14;
const PADDING_HORIZONTAL = 16;
const PADDING_VERTICAL = 12;
const SPRING_CONFIG = {
  damping: 18,
  mass: 0.45,
  stiffness: 190,
};

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
      scale.value = withSpring(1, SPRING_CONFIG);
      opacity.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.ease) });
    } else {
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
    const width = Math.min(contentSize.width, maxWidth);
    const height = contentSize.height;

    const triggerCenterX = triggerFrame.x + triggerFrame.width / 2;
    const triggerTop = triggerFrame.y;
    const triggerBottom = triggerFrame.y + triggerFrame.height;

    const spaceAbove = triggerTop - SCREEN_MARGIN;
    const spaceBelow = windowHeight - triggerBottom - SCREEN_MARGIN;

    const shouldDisplayAbove = spaceBelow < height + TOOLTIP_SPACING && spaceAbove > spaceBelow;

    let top: number;
    if (shouldDisplayAbove) {
      top = Math.max(SCREEN_MARGIN, triggerTop - height - TOOLTIP_SPACING);
    } else {
      top = Math.min(
        windowHeight - height - SCREEN_MARGIN,
        triggerBottom + TOOLTIP_SPACING
      );
    }

    let left = triggerCenterX - width / 2;
    left = clamp(left, SCREEN_MARGIN, windowWidth - width - SCREEN_MARGIN);

    return {
      top,
      left,
      width,
    };
  }, [contentSize, triggerFrame, windowHeight, windowWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const contentStyle = useMemo(
    () => [styles.content, { maxWidth: windowWidth - SCREEN_MARGIN * 2 }],
    [windowWidth]
  );

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

          {tooltipGeometry ? (
            <Animated.View
              pointerEvents="box-none"
              style={[
                styles.tooltipWrapper,
                { top: tooltipGeometry.top, left: tooltipGeometry.left },
                animatedStyle,
              ]}
            >
              <View style={styles.background}>
                <BlurView tint="dark" intensity={50} style={StyleSheet.absoluteFill} />
                <View style={[StyleSheet.absoluteFill, styles.backdrop]} />
                <View
                  onLayout={handleContentLayout}
                  style={contentStyle}
                >
                  <AppText role="Subhead" color="white" style={styles.text}>
                    {text}
                  </AppText>
                </View>
              </View>
            </Animated.View>
          ) : (
            <View style={styles.measureContainer} pointerEvents="none">
              <View onLayout={handleContentLayout} style={contentStyle}>
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
  background: {
    borderRadius: CORNER_RADIUS,
    overflow: "hidden",
  },
  backdrop: {
    backgroundColor: "rgba(15, 15, 15, 0.6)",
  },
  content: {
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
