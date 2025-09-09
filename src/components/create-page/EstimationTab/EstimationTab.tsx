import React from "react";
import { View, TextInput as RNTextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useTheme } from "@/theme";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { TextInput } from "@/components/shared/TextInput";
import type { FoodLog } from "@/types/models";
import { createStyles } from "./EstimationTab.styles";

interface EstimationTabProps {
  newLog: FoodLog;
  onLogChange: (updates: Partial<FoodLog>) => void;
  isUploadingImage: boolean;
  textInputRef: React.RefObject<RNTextInput | null>;
  inputAccessoryViewID: string;
}

export const EstimationTab: React.FC<EstimationTabProps> = ({
  newLog,
  onLogChange,
  isUploadingImage,
  textInputRef,
  inputAccessoryViewID,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme, !!newLog.supabaseImagePath);

  const handleDescriptionChange = (text: string) => {
    onLogChange({ description: text });
  };

  return (
    <KeyboardAwareScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      bottomOffset={250}
    >
      <View style={styles.content}>
        <ImageDisplay
          imageUrl={newLog.supabaseImagePath}
          isUploading={isUploadingImage}
        />
        <TextInput
          ref={textInputRef}
          value={newLog.description || ""}
          onChangeText={handleDescriptionChange}
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