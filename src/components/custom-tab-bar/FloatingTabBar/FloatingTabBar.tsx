import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme";
import { createStyles } from "./FloatingTabBar.styles";
import { FloatingSegmentedControl } from "../FloatingSegmentedControl";
import { FloatingNewButton } from "../FloatingNewButton";
import { BlurredBackground } from "@/components/shared";

interface FloatingTabBarProps {
  selectedIndex: number;
  onSegmentChange: (index: number) => void;
  onNewPress: () => void;
  segments: string[];
}

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  selectedIndex,
  onSegmentChange,
  onNewPress,
  segments,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
  const insets = useSafeAreaInsets();

  return (
    <>
      <BlurredBackground 
        position="bottom" 
        height={90}
        intensity={10}
        opacity={0.6}
      />
      <View
        style={[
          styles.container,
          {
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.segmentedControlWrapper}>
            <FloatingSegmentedControl
              selectedIndex={selectedIndex}
              onSegmentChange={onSegmentChange}
              segments={segments}
            />
          </View>
          <View style={styles.segmentedButtonWrapper}>
            <FloatingNewButton onPress={onNewPress} />
          </View>
        </View>
      </View>
    </>
  );
};
