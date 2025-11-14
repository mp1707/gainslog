import { useRef, useMemo } from "react";
import { View, TextInput as RNTextInput } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

import { FoodLog, Favorite } from "@/types/models";
import { useTheme } from "@/theme/ThemeProvider";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { TextInput } from "@/components/shared/TextInput";
import { FavoritesSection } from "@/components/create-page/FavoritesSection";
import { ImageSection } from "@/components/create-page/ImageSection";
import { CreateActions } from "@/components/create-page/CreateActions";
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
}: TypingModeViewProps) => {
  const { t } = useTranslation();
  const { theme, colors, colorScheme } = useTheme();
  const styles = useMemo(
    () => createStyles(theme, colors, colorScheme),
    [theme, colors, colorScheme]
  );

  const textInputRef = useRef<RNTextInput>(null);
  useDelayedAutofocus(textInputRef);

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
      <FavoritesSection
        favorites={filteredFavorites}
        onSelectFavorite={onSelectFavorite}
        isVisible={!(draft.localImagePath || isProcessingImage)}
      />
      <ImageSection
        imageUrl={draft.localImagePath}
        isProcessing={isProcessingImage}
        onRemoveImage={onRemoveImage}
        isVisible={!!(draft.localImagePath || isProcessingImage)}
      />
      <CreateActions
        onSwitchToCamera={onSwitchToCamera}
        onSwitchToRecording={onSwitchToRecording}
        onEstimate={onEstimate}
        canContinue={canContinue}
        isEstimating={isEstimating}
      />
    </Animated.View>
  );
};
