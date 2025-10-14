import React, { useCallback } from "react";
import { View, TextInput as RNTextInput, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as Haptics from "expo-haptics";
import { Info } from "lucide-react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "@/theme";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { TextInput } from "@/components/shared/TextInput";
import { AppText } from "@/components/shared/AppText";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { createStyles } from "./EstimationTab.styles";

interface EstimationTabProps {
  description?: string;
  onDescriptionChange: (description: string) => void;
  imageUrl?: string;
  isUploadingImage: boolean;
  textInputRef: React.RefObject<RNTextInput | null>;
  inputAccessoryViewID: string;
}

export const EstimationTab: React.FC<EstimationTabProps> = ({
  description,
  onDescriptionChange,
  imageUrl,
  isUploadingImage,
  textInputRef,
  inputAccessoryViewID,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme, !!imageUrl, colorScheme);
  const router = useSafeRouter();
  const { handlePressIn, handlePressOut, pressAnimatedStyle } = usePressAnimation();

  const handleOpenExplainer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/explainer-ai-estimation");
  }, [router]);

  return (
    <KeyboardAwareScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      bottomOffset={250}
    >
      <View style={styles.content}>
        {(imageUrl || isUploadingImage) && (
          <ImageDisplay imageUrl={imageUrl} isUploading={isUploadingImage} />
        )}
        <Pressable
          onPress={handleOpenExplainer}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Learn how to get the best AI estimates"
        >
          <Animated.View style={[styles.header, pressAnimatedStyle]}>
            <AppText role="Title2">Describe your meal</AppText>
            <Info size={20} color={colors.accent} strokeWidth={1.5} />
          </Animated.View>
        </Pressable>
        <TextInput
          ref={textInputRef}
          value={description || ""}
          onChangeText={onDescriptionChange}
          placeholder="e.g. 100g of chicken breast"
          multiline={true}
          inputAccessoryViewID={inputAccessoryViewID}
          fontSize="Headline"
          style={styles.textInputContainer}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};
