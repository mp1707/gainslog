import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { Button } from "@/components/index";
import { AppText } from "@/components/shared/AppText";
import { ImagePicker } from "@/components/shared/ImagePicker";
// import { TextInput } from "@/components/shared/TextInput";
import { Toggle } from "@/components/shared/Toggle";
import {
  InputAccessory,
  InputAccessoryView,
} from "@/components/shared/InputAccessory";
import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { FoodLog } from "@/types/models";
import { useRouter } from "expo-router";
import { SparkleIcon, PencilIcon } from "phosphor-react-native";
import { useCallback, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAudioTranscription } from "@/hooks/useAudioTranscription";
import { AudioTranscriptionButton } from "@/components/shared/TextInput/AudioTranscriptionButton";
import { TranscriptionOverlay } from "@/components/shared/TextInput/TranscriptionOverlay";

const inputAccessoryViewID = "create-input-accessory";

export default function Create() {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
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

  // Audio transcription hook
  const handleTranscriptionComplete = useCallback((text: string) => {
    setNewLog((prev) => ({
      ...prev,
      description: prev.description + " " + text,
    }));
  }, []);

  const { isRecording, liveTranscription, toggleRecording } =
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

  const handleButton2 = useCallback(() => {
    console.log("Button 2 pressed");
  }, []);

  return (
    <View style={styles.container}>
      <ModalHeader onCancel={handleCancel} onSave={handleCancel} />
      <View style={styles.contentContainer}>
        <View style={styles.content}>
          <Toggle
            value={estimationType}
            options={[
              { label: "AI Estimation", value: "ai", icon: SparkleIcon },
              { label: "Manual Entry", value: "manual", icon: PencilIcon },
            ]}
            onChange={setEstimationType}
          />
          {/* <ImagePicker
          newLog={newLog}
          setNewLog={(log) => setNewLog(log as FoodLog)}
          /> */}
          {/* <TextInput
            value={newLog.description || ""}
            onChangeText={(text) => setNewLog({ ...newLog, description: text })}
            placeholder="Description"
            // autoExpand={true}
            multiline={true}
            allowAudioTranscription={true}
            inputAccessoryViewID={inputAccessoryViewID}
          /> */}
          <View style={styles.textInputContainer}>
            <TextInput
              value={newLog.description || ""}
              onChangeText={(text) =>
                setNewLog({ ...newLog, description: text })
              }
              placeholder="e.g. 100g of chicken breast"
              style={styles.textInput}
              multiline={true}
              collapsable={true}
              inputAccessoryViewID={inputAccessoryViewID}
            />
            <AudioTranscriptionButton
              isRecording={isRecording}
              onPress={toggleRecording}
            />
          </View>
        </View>

        {/* Bottom InputAccessoryView for demonstration */}
        <View style={styles.bottomContainer}>
          <InputAccessoryView
            primaryText="Button1"
            onPrimaryPress={handleButton1}
            isValid={true}
            secondaryText="Button2"
            onSecondaryPress={handleButton2}
            accessibilityLabel="Demo buttons"
          />
        </View>
      </View>

      {/* InputAccessory for TextInput */}
      <InputAccessory
        nativeID={inputAccessoryViewID}
        primaryText="Estimate"
        onPrimaryPress={handleButton1}
        isValid={true}
        secondaryText="Add Foto"
        onSecondaryPress={handleButton2}
        accessibilityLabel="Demo input accessory buttons"
      />
      <TranscriptionOverlay
        visible={isRecording}
        liveTranscription={liveTranscription}
        onStop={toggleRecording}
      />
    </View>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
      gap: theme.spacing.md,
    },
    contentContainer: {
      flex: 1,
      justifyContent: "space-between",
    },
    content: {
      gap: theme.spacing.xl,
      marginHorizontal: theme.spacing.md,
    },
    bottomContainer: {
      paddingBottom: theme.spacing.lg,
      backgroundColor: colors.secondaryBackground,
    },
    textInput: {
      height: 100,
      borderWidth: 0,
      flex: 1,
      backgroundColor: "transparent",
      color: colors.primaryText,
      margin: theme.spacing.md,
      minHeight: 500,
      ...theme.typography.Title2,
    },
    textInputContainer: {
      flexDirection: "row",
      flex: 1,
      justifyContent: "space-between",
      gap: theme.spacing.md,
    },
  });
