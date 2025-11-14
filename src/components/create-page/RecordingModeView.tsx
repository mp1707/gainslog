import { useMemo } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Square } from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { RoundButton } from "@/components/shared/RoundButton";
import { Waveform } from "@/components/create-page/Waveform/Waveform";
import { createStyles } from "./RecordingModeView.styles";

interface RecordingModeViewProps {
  volumeLevel: number;
  isRecording: boolean;
  isTransitioning: boolean;
  onStopRecording: () => void;
}

export const RecordingModeView = ({
  volumeLevel,
  isRecording,
  isTransitioning,
  onStopRecording,
}: RecordingModeViewProps) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const isActive = isRecording || isTransitioning;

  return (
    <Animated.View
      entering={FadeIn.springify().damping(30).stiffness(400)}
      exiting={FadeOut.springify().damping(30).stiffness(400)}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.waveformContainer}>
          <Waveform
            volumeLevel={volumeLevel}
            isActive={isActive}
            containerStyle={styles.waveform}
            barStyle={styles.waveformBar}
          />
        </View>

        <RoundButton
          Icon={Square}
          onPress={onStopRecording}
          variant="secondary"
          iconSize={24}
          style={styles.stopButton}
        />
      </View>
    </Animated.View>
  );
};
