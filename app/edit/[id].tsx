import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { AppText, Button } from "@/components/index";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { FoodLog } from "@/types/models";
import { useState } from "react";
import { NutritionEditCard } from "@/components/edit-page/NutritionEditCard";
import { SparkleIcon } from "phosphor-react-native";
import { useEstimation } from "@/hooks/useEstimation";
import { InputAccessory, InputAccessoryView } from "@/components/shared";

const titleAccessoryViewID = "edit-title-input-accessory";
const descriptionAccessoryViewID = "edit-description-input-accessory";

export default function Edit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { foodLogs, updateFoodLog, selectedDate } = useAppStore();
  const originalLog = foodLogs.find((log) => log.id === id);
  const [editLog, setEditLog] = useState<FoodLog | undefined>(originalLog);
  const [isReEstimating, setIsReEstimating] = useState(false);
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme);
  const { back } = useRouter();
  const { startReEstimation } = useEstimation();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  if (!editLog) return;
  if (!originalLog) return;

  const handleCancel = () => {
    back();
  };
  const handleDone = () => {
    if (editLog) {
      updateFoodLog(id, { ...editLog, logDate: selectedDate });
    }
    back();
  };

  const changesWereMade =
    editLog.description !== originalLog.description ||
    editLog.imageUrl !== originalLog.imageUrl;

  const caNreEstimate =
    (changesWereMade && editLog?.description?.trim() !== "") ||
    (editLog?.imageUrl !== "" && editLog?.imageUrl !== originalLog.imageUrl);

  const handleUpdateNutrition = (field: string, value: number) => {
    setEditLog({ ...editLog, [field]: value });
  };

  const handleReEstimate = () => {
    console.log("handleReEstimate");
    startReEstimation(editLog, (log) => {
      setEditLog(log);
      setIsReEstimating(false);
    });
    setIsReEstimating(true);
    setIsKeyboardVisible(false);
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ModalHeader
        onCancel={handleCancel}
        onSave={handleDone}
        disabled={false}
      />
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: colors.primaryBackground },
        ]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <ImageDisplay imageUrl={originalLog?.imageUrl} isUploading={false} />
        <View style={styles.section}>
          <AppText role="Headline">Title</AppText>
          <TextInput
            value={editLog?.title}
            onChangeText={(text) =>
              editLog && setEditLog({ ...editLog, title: text })
            }
            placeholder="Enter title"
            style={styles.textInput}
            keyboardAppearance={colorScheme}
            onFocus={() => setIsKeyboardVisible(true)}
            onBlur={() => setIsKeyboardVisible(false)}
            inputAccessoryViewID={titleAccessoryViewID}
          />
          <InputAccessory
            nativeID={titleAccessoryViewID}
            primaryAction={{
              icon: SparkleIcon,
              label: isReEstimating
                ? "Working on it..."
                : "Re-estimate nutrition",
              onPress: handleReEstimate,
              isValid: caNreEstimate && !isReEstimating,
            }}
            accessibilityLabel="Re-estimate nutrition"
          />
        </View>
        <View style={styles.section}>
          <AppText role="Headline">Description</AppText>
          <TextInput
            value={editLog?.description}
            onChangeText={(text) =>
              editLog && setEditLog({ ...editLog, description: text })
            }
            placeholder="Enter description"
            multiline
            style={[styles.textInput, { minHeight: 100 }]}
            keyboardAppearance={colorScheme}
            onFocus={() => setIsKeyboardVisible(true)}
            onBlur={() => setIsKeyboardVisible(false)}
            inputAccessoryViewID={descriptionAccessoryViewID}
          />
          <InputAccessory
            nativeID={descriptionAccessoryViewID}
            primaryAction={{
              icon: SparkleIcon,
              label: isReEstimating
                ? "Working on it..."
                : "Re-estimate nutrition",
              onPress: handleReEstimate,
              isValid: caNreEstimate && !isReEstimating,
            }}
            accessibilityLabel="Re-estimate nutrition"
          />
        </View>
        <View style={styles.section}>
          <AppText role="Headline">Nutrition</AppText>
          <NutritionEditCard
            log={editLog}
            onUpdateNutrition={handleUpdateNutrition}
            isStale={changesWereMade}
            isLoading={isReEstimating}
          />
        </View>
      </ScrollView>
      {!isKeyboardVisible && (
        <View style={styles.bottomContainer}>
          <InputAccessoryView
            primaryAction={{
              icon: SparkleIcon,
              label: isReEstimating
                ? "Working on it..."
                : "Re-estimate nutrition",
              onPress: handleReEstimate,
              isValid: caNreEstimate && !isReEstimating,
            }}
            accessibilityLabel="Re-estimate nutrition"
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    contentContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.lg,
    },
    textInput: {
      ...theme.typography.Body,
      borderWidth: 1,
      borderRadius: theme.components.buttons.cornerRadius,
      padding: theme.spacing.md,
      minHeight: 50,
      textAlignVertical: "top",
      color: colors.primaryText,
      backgroundColor: colors.secondaryBackground,
      borderColor: colors.border,
    },
    section: {
      gap: theme.spacing.sm,
    },
    bottomContainer: {
      paddingBottom: theme.spacing.xl + 50,
      backgroundColor: colors.secondaryBackground,
    },
  });
