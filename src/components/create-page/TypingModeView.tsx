import { useRef, useMemo } from "react";
import { View, TextInput as RNTextInput } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

import { FoodLog, Favorite } from "@/types/models";
import { useTheme } from "@/theme/ThemeProvider";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { TextInput } from "@/components/shared/TextInput";
import { AppText } from "@/components/shared/AppText";
import { FavoritesSection } from "@/components/create-page/FavoritesSection";
import { ImageSection } from "@/components/create-page/ImageSection";
import { CreateActions } from "@/components/create-page/CreateActions";
import { Waveform } from "@/components/create-page/Waveform/Waveform";
import { HeaderButton } from "@/components/shared/HeaderButton";
import { CREATE_ACCESSORY_HEIGHT } from "@/constants/create";
import { createStyles } from "./TypingModeView.styles";

interface TypingModeViewProps {
  draft: FoodLog;
  filteredFavorites: Favorite[];
  isProcessingImage: boolean;
  onDescriptionChange: (text: string) => void;
  onSelectFavorite: (favorite: Favorite) => void;
  onRemoveImage: () => void;
  onSwitchToCamera: () => void;
  onSwitchToRecording: () => void;
  onEstimate: () => void;
  canContinue: boolean;
  isEstimating: boolean;
  isRecording: boolean;
  volumeLevel: number;
  onStopRecording: () => void;
}

export const TypingModeView = ({
  draft,
  filteredFavorites,
  isProcessingImage,
  onDescriptionChange,
  onSelectFavorite,
  onRemoveImage,
  onSwitchToCamera,
  onSwitchToRecording,
  onEstimate,
  canContinue,
  isEstimating,
  isRecording,
  volumeLevel,
  onStopRecording,
}: TypingModeViewProps) => {
  const { t } = useTranslation();
  const { theme, colors, colorScheme } = useTheme();
  const styles = useMemo(
    () => createStyles(theme, colors, colorScheme),
    [theme, colors, colorScheme]
  );

  const textInputRef = useRef<RNTextInput>(null);
  useDelayedAutofocus(textInputRef);

  const isRecordingActive = isRecording;
  const hasImage = !!(draft.localImagePath || isProcessingImage);
  const showImageSection = !isRecordingActive && hasImage;
  const showFavoritesSection =
    !isRecordingActive && !hasImage && filteredFavorites.length > 0;

  const sectionTitle = isRecordingActive
    ? t("createLog.recording.title")
    : showImageSection
    ? t("createLog.image.title")
    : showFavoritesSection
    ? t("createLog.favorites.title")
    : null;

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      <TextInput
        ref={textInputRef}
        value={draft.description || ""}
        onChangeText={onDescriptionChange}
        placeholder={t("createLog.input.placeholder")}
        multiline
        fontSize="Headline"
        style={styles.textInputField}
        containerStyle={styles.textInputContainer}
        focusBorder={false}
        accessibilityLabel={t("createLog.input.accessibilityLabel")}
      />

      {sectionTitle && (
        <View style={styles.accessorySection}>
          <AppText role="Caption" style={styles.sectionHeading}>
            {sectionTitle}
          </AppText>
          <View style={styles.accessorySlot}>
            {isRecordingActive && (
              <View style={styles.recordingContent}>
                <Waveform
                  volumeLevel={volumeLevel}
                  isActive={isRecordingActive}
                  containerStyle={styles.waveform}
                  barStyle={styles.waveformBar}
                />
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
            )}
            {showImageSection && (
              <ImageSection
                imageUrl={draft.localImagePath}
                isProcessing={isProcessingImage}
                onRemoveImage={onRemoveImage}
                isVisible={showImageSection}
                collapsedHeight={CREATE_ACCESSORY_HEIGHT}
              />
            )}
            {showFavoritesSection && (
              <FavoritesSection
                favorites={filteredFavorites}
                onSelectFavorite={onSelectFavorite}
                isVisible={showFavoritesSection}
                minHeight={CREATE_ACCESSORY_HEIGHT}
              />
            )}
          </View>
        </View>
      )}
      {!isRecordingActive && (
        <CreateActions
          onSwitchToCamera={onSwitchToCamera}
          onSwitchToRecording={onSwitchToRecording}
          onEstimate={onEstimate}
          canContinue={canContinue}
          isEstimating={isEstimating}
        />
      )}
    </Animated.View>
  );
};
