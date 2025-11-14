import { useMemo } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Square } from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { RoundButton } from "@/components/shared/RoundButton";
import { Waveform } from "@/components/create-page/Waveform/Waveform";
import { AppText } from "@/components/shared/AppText";
import { createStyles } from "./RecordingModeView.styles";
import { HeaderButton } from "../shared/HeaderButton";

interface RecordingModeViewProps {
  volumeLevel: number;
  isRecording: boolean;
  isTransitioning: boolean;
  liveTranscription: string;
  onStopRecording: () => void;
}

export const RecordingModeView = ({
  volumeLevel,
  isRecording,
  isTransitioning,
  liveTranscription,
  onStopRecording,
}: RecordingModeViewProps) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const isActive = isRecording || isTransitioning;

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.waveformRow}>
          <View style={styles.waveformContainer}>
            <Waveform
              volumeLevel={volumeLevel}
              isActive={isActive}
              containerStyle={styles.waveform}
              barStyle={styles.waveformBar}
            />
          </View>
          <HeaderButton
            variant="colored"
            buttonProps={{
              onPress: onStopRecording,
              color: colors.errorBackground,
              variant: "glassProminent",
            }}
            imageProps={{
              systemName: "square",
              color: colors.error,
            }}
          />
        </View>
        {liveTranscription && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.transcriptionContainer}
          >
            <AppText role="Headline" style={styles.transcriptionText}>
              {liveTranscription}
            </AppText>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};
