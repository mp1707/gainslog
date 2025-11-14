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
import { INPUT_ACCESSORY_VIEW_ID } from "@/constants/create";
import { createStyles } from "./TypingModeView.styles";

interface TypingModeViewProps {
  draft: FoodLog;
  filteredFavorites: Favorite[];
  isProcessingImage: boolean;
  onDescriptionChange: (text: string) => void;
  onSelectFavorite: (favorite: Favorite) => void;
  onRemoveImage: () => void;
}

export const TypingModeView = ({
  draft,
  filteredFavorites,
  isProcessingImage,
  onDescriptionChange,
  onSelectFavorite,
  onRemoveImage,
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
      entering={FadeIn.springify().damping(30).stiffness(400)}
      exiting={FadeOut.springify().damping(30).stiffness(400)}
      style={styles.container}
    >
      <TextInput
        ref={textInputRef}
        value={draft.description || ""}
        onChangeText={onDescriptionChange}
        placeholder={t("createLog.input.placeholder")}
        multiline
        inputAccessoryViewID={INPUT_ACCESSORY_VIEW_ID}
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
    </Animated.View>
  );
};
