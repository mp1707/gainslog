import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { AppText, Button, Card } from "@/components/index";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Keyboard, StyleSheet, View } from "react-native";
import { FoodLog } from "@/types/models";
import { useState } from "react";
import { NutritionEditCard } from "@/components/edit-page/NutritionEditCard";
import { Camera, Sparkles, X } from "lucide-react-native";
import { useEstimation } from "@/hooks/useEstimation";
import { ConfidenceBadge, SkeletonPill } from "@/components/shared";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useImageSelection } from "@/hooks/useImageSelection";
import { TextInput } from "@/components/shared/TextInput";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { showImagePickerAlert } = useImageSelection({
    onImageSelected: (imageUrl: string) => {
      setEditLog((prev) =>
        prev ? { ...prev, supabaseImagePath: imageUrl } : undefined
      );
      setIsUploadingImage(false);
    },
    onUploadStart: () => {
      setIsUploadingImage(true);
    },
    onUploadError: () => {
      setIsUploadingImage(false);
    },
  });

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
    editLog.supabaseImagePath !== originalLog.supabaseImagePath;

  const caNreEstimate =
    (changesWereMade && editLog?.description?.trim() !== "") ||
    (editLog?.supabaseImagePath !== "" &&
      editLog?.supabaseImagePath !== originalLog.supabaseImagePath);

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
    Keyboard.dismiss();
  };

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
          imageUrl={editLog?.supabaseImagePath}
          isUploading={isUploadingImage}
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
        <View style={styles.keyboardAccessory}>
          <RoundButton
            variant="tertiary"
            onPress={showImagePickerAlert}
            Icon={Camera}
          />

          <Button
            variant="primary"
            label={estimateLabel}
            onPress={handleReEstimate}
            disabled={!caNreEstimate || isReEstimating}
            Icon={Sparkles}
          />
        </View>
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
    keyboardAccessory: {
      marginHorizontal: theme.spacing.sm,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.spacing.sm,
      borderRadius: 16,

      overflow: "hidden",
      zIndex: 99,
    },
  });
