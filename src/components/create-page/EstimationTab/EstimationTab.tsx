import React from "react";
import { View, TextInput as RNTextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useTheme } from "@/theme";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { TextInput } from "@/components/shared/TextInput";
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

  return (
    <KeyboardAwareScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      bottomOffset={250}
    >
      <View style={styles.content}>
        <ImageDisplay imageUrl={imageUrl} isUploading={isUploadingImage} />
        <TextInput
          ref={textInputRef}
          value={description || ""}
          onChangeText={onDescriptionChange}
          placeholder="e.g. 100g of chicken breast"
          multiline={true}
          inputAccessoryViewID={inputAccessoryViewID}
          fontSize="Title2"
          style={styles.textInputContainer}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};
