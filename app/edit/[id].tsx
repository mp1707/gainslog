import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { AppText, Button, Card } from "@/components/index";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Keyboard, StyleSheet, View } from "react-native";
import { FoodLog } from "@/types/models";
import { useCallback, useState } from "react";
import { NutritionEditCard } from "@/components/edit-page/NutritionEditCard";
import { X } from "lucide-react-native";
import { KeyboardAccessory } from "@/components/create-page/KeyboardAccessory/KeyboardAccessory";
import { useEstimation } from "@/hooks/useEstimation";
import { ConfidenceBadge, SkeletonPill } from "@/components/shared";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { TextInput } from "@/components/shared/TextInput";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { processImage } from "@/utils/processImage";
import { uploadToSupabaseStorage } from "@/utils/uploadToSupabaseStorage";
import * as FileSystem from "expo-file-system";
import { showErrorToast } from "@/lib/toast";

export default function Edit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { foodLogs, updateFoodLog, selectedDate } = useAppStore();
  const originalLog = foodLogs.find((log) => log.id === id);
  const [editLog, setEditLog] = useState<FoodLog | undefined>(originalLog);
  const [isReEstimating, setIsReEstimating] = useState(false);
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
  const { back } = useRouter();
  const { startReEstimation } = useEstimation();
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const cleanupOldImage = async (imagePath: string) => {
    if (imagePath) {
      try {
        const result = await FileSystem.deleteAsync(imagePath, {
          idempotent: true,
        });
      } catch (error) {
        console.log("Error deleting old image:", error);
      }
    }
  };

  if (!editLog) return;
  if (!originalLog) return;

  const handleCancel = () => {
    back();
  };

  const changesWereMade =
    editLog.description !== originalLog.description ||
    editLog.localImagePath !== originalLog.localImagePath;

  const canReEstimate =
    (changesWereMade && editLog?.description?.trim() !== "") ||
    (editLog?.localImagePath !== "" &&
      editLog?.localImagePath !== originalLog.localImagePath);

  const handleUpdateNutrition = (field: string, value: number) => {
    setEditLog({ ...editLog, [field]: value });
  };

  const handleReEstimate = async () => {
    setIsReEstimating(true);
    Keyboard.dismiss();

    try {
      let logToEstimate = editLog;

      // If there's a local image and user is re-estimating (image needs fresh Supabase upload)
      if (
        editLog?.localImagePath &&
        editLog.localImagePath === originalLog?.localImagePath
      ) {
        const newSupabaseImagePath = await uploadToSupabaseStorage(
          editLog.localImagePath
        );
        logToEstimate = { ...editLog, supabaseImagePath: newSupabaseImagePath };
        setEditLog(logToEstimate);
      }

      startReEstimation(logToEstimate, (log) => {
        setEditLog(log);
        setIsReEstimating(false);
      });
    } catch (error) {
      console.log("Error during re-estimation:", error);
      setIsReEstimating(false);
    }
  };

  const handleImageSelected = useCallback(
    async (uri: string) => {
      setIsProcessingImage(true);
      try {
        // Clean up old local image before adding new one
        if (editLog?.localImagePath) {
          await cleanupOldImage(editLog.localImagePath);
        }

        const { localImagePath, supabaseImagePath } = await processImage(uri);

        setEditLog((prev) =>
          prev
            ? {
                ...prev,
                localImagePath,
                supabaseImagePath,
                // Reset nutrition values when new image is added
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                estimationConfidence: 0,
              }
            : undefined
        );
      } catch (error) {
        showErrorToast("Error processing image", "Please try again.");
      } finally {
        setIsProcessingImage(false);
      }
    },
    [editLog?.localImagePath]
  );

  const estimateLabel = isReEstimating ? "estimating" : "Re-estimate";

  return (
    <GradientWrapper style={styles.container}>
      <View style={styles.closeButton}>
        <RoundButton
          Icon={X}
          onPress={handleCancel}
          variant={"tertiary"}
          accessibilityLabel="Close"
        />
      </View>
      <KeyboardAwareScrollView
        style={[styles.scrollView]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        bottomOffset={130}
      >
        <ImageDisplay
          imageUrl={editLog?.localImagePath}
          isUploading={isProcessingImage}
        />
        <View style={styles.section}>
          <AppText role="Headline">Title</AppText>
          <TextInput
            value={editLog?.title}
            onChangeText={(text) =>
              editLog && setEditLog({ ...editLog, title: text })
            }
            placeholder="Enter title"
            style={styles.textInputContainer}
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
            style={[styles.textInputContainer, { minHeight: 100 }]}
          />
        </View>
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <AppText role="Headline">Nutrition</AppText>
            {isReEstimating ? (
              <SkeletonPill width={80} height={28} />
            ) : (
              <ConfidenceBadge
                estimationConfidence={editLog?.estimationConfidence}
              />
            )}
          </View>
          <NutritionEditCard
            log={editLog}
            onUpdateNutrition={handleUpdateNutrition}
            isStale={changesWereMade}
            isLoading={isReEstimating}
          />
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: -30, opened: -10 }}>
        <KeyboardAccessory
          onImageSelected={handleImageSelected}
          onEstimate={handleReEstimate}
          estimateLabel={estimateLabel}
          canContinue={canReEstimate && !isReEstimating}
        />
      </KeyboardStickyView>
    </GradientWrapper>
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
      paddingTop: theme.spacing.xxl + theme.spacing.md,
    },
    closeButton: {
      position: "absolute",
      top: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 15,
    },
    contentContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.lg,
    },
    textInputContainer: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: theme.components.buttons.cornerRadius,
      minHeight: 50,
    },
    section: {
      gap: theme.spacing.sm,
    },
    bottomContainer: {
      // marginBottom: theme.spacing.xl,
    },
    buttonWrapperLeft: {
      flex: 1,
    },
    buttonWrapperRight: {
      flex: 2,
    },
    sectionTitle: {
      gap: theme.spacing.sm,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  });
