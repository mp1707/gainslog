import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
// import { TextInput } from "@/components/shared/TextInput";
import { Toggle } from "@/components/shared/Toggle";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import {
  InputAccessory,
  InputAccessoryView,
} from "@/components/shared/InputAccessory";
import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { FoodLog } from "@/types/models";
import { useRouter } from "expo-router";
import {
  SparkleIcon,
  PencilIcon,
  CameraIcon,
  MicrophoneIcon,
} from "phosphor-react-native";
import { useCallback, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useAudioTranscription } from "@/hooks/useAudioTranscription";
import { useImageSelection } from "@/hooks/useImageSelection";
import { TranscriptionOverlay } from "@/components/shared/TextInput/TranscriptionOverlay";

const inputAccessoryViewID = "create-input-accessory";

export default function Create() {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [estimationType, setEstimationType] = useState<"ai" | "manual">("ai");
  const { selectedDate } = useAppStore();
  const [newLog, setNewLog] = useState<FoodLog>({
    id: "",
    title: "",
    description: "",
    imageUrl: "",
    logDate: selectedDate,
    createdAt: new Date().toISOString(),
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  // Audio transcription hook
  const handleTranscriptionComplete = useCallback((text: string) => {
    setNewLog((prev) => ({
      ...prev,
      description:
        prev.description !== "" ? prev.description + " " + text : text,
    }));
  }, []);

  const { isRecording, liveTranscription, toggleRecording, startRecording } =
    useAudioTranscription({
      onTranscriptionComplete: handleTranscriptionComplete,
      initialValue: "",
      disabled: false,
    });

  const { back } = useRouter();
  const handleCancel = useCallback(() => {
    back();
  }, [back]);

  const handleButton1 = useCallback(() => {
    console.log("Button 1 pressed");
  }, []);

  const { showImagePickerAlert } = useImageSelection({
    onImageSelected: (imageUrl: string) => {
      setNewLog((prev) => ({ ...prev, imageUrl }));
      setIsUploadingImage(false);
    },
    onUploadStart: () => {
      setIsUploadingImage(true);
    },
    onUploadError: () => {
      setIsUploadingImage(false);
    },
  });

  const handleButton2 = useCallback(() => {
    showImagePickerAlert();
  }, [showImagePickerAlert]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ModalHeader onCancel={handleCancel} onSave={handleCancel} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <View style={styles.content}>
          <Toggle
            value={estimationType}
            options={[
              { label: "AI Estimation", value: "ai", icon: SparkleIcon },
              { label: "Manual Entry", value: "manual", icon: PencilIcon },
            ]}
            onChange={setEstimationType}
          />

          <ImageDisplay
            imageUrl={newLog.imageUrl}
            isUploading={isUploadingImage}
          />
          <Pressable 
            style={styles.textInputContainer}
            onPress={() => textInputRef.current?.focus()}
          >
            <TextInput
              ref={textInputRef}
              value={newLog.description || ""}
              onChangeText={(text) => setNewLog({ ...newLog, description: text })}
              placeholder="e.g. 100g of chicken breast"
              style={styles.textInput}
              multiline={true}
              onFocus={() => setIsKeyboardVisible(true)}
              onBlur={() => setIsKeyboardVisible(false)}
              inputAccessoryViewID={inputAccessoryViewID}
            />
          </Pressable>
        </View>
      </ScrollView>

      {!isKeyboardVisible && (
        <View style={styles.bottomContainer}>
          <InputAccessoryView
            primaryAction={{
              icon: SparkleIcon,
              label: "Estimate",
              onPress: handleButton1,
              isValid: true,
            }}
            secondaryAction={{
              icon: CameraIcon,
              label: "",
              onPress: handleButton2,
            }}
            tertiaryAction={{
              icon: MicrophoneIcon,
              label: "",
              onPress: startRecording,
            }}
            accessibilityLabel="Demo buttons"
          />
        </View>
      )}

      {/* InputAccessory for TextInput */}
      <InputAccessory
        nativeID={inputAccessoryViewID}
        primaryAction={{
          icon: SparkleIcon,
          label: "Estimate",
          onPress: handleButton1,
          isValid: true,
        }}
        secondaryAction={{
          icon: CameraIcon,
          label: "",
          onPress: handleButton2,
        }}
        tertiaryAction={{
          icon: MicrophoneIcon,
          label: "",
          onPress: startRecording,
        }}
        accessibilityLabel="Demo buttons"
      />
      <TranscriptionOverlay
        visible={isRecording}
        liveTranscription={liveTranscription}
        onStop={toggleRecording}
      />
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing.lg,
    },
    content: {
      flex: 1,
      gap: theme.spacing.xl,
      marginHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
    },
    bottomContainer: {
      paddingBottom: theme.spacing.lg,
      backgroundColor: colors.secondaryBackground,
    },
    textInputContainer: {
      flex: 1,
      minHeight: 200,
    },
    textInput: {
      minHeight: 120,
      borderWidth: 0,
      backgroundColor: "transparent",
      color: colors.primaryText,
      padding: theme.spacing.md,
      textAlignVertical: 'top',
      ...theme.typography.Title2,
    },
  });
