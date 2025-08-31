import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { AppText, Button, Card } from "@/components/index";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { FoodLog } from "@/types/models";
import { useState } from "react";
import { NutritionEditCard } from "@/components/edit-page/NutritionEditCard";
import { CameraIcon, SparkleIcon } from "phosphor-react-native";
import { useEstimation } from "@/hooks/useEstimation";
import { ConfidenceBadge, SkeletonPill } from "@/components/shared";
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useImageSelection } from "@/hooks/useImageSelection";
import { TextInput } from "@/components/shared/TextInput";

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { showImagePickerAlert } = useImageSelection({
    onImageSelected: (imageUrl: string) => {
      setEditLog((prev) => (prev ? { ...prev, imageUrl } : undefined));
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
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <ModalHeader
        onCancel={handleCancel}
        onSave={handleDone}
        disabled={false}
      />
      <KeyboardAwareScrollView
        style={[styles.scrollView]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        bottomOffset={130}
      >
        <ImageDisplay
          imageUrl={editLog?.imageUrl}
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
        <Card style={styles.keyboardAccessory}>
          <View style={styles.buttonWrapperLeft}>
            <Button
              variant="secondary"
              onPress={showImagePickerAlert}
              icon={<CameraIcon size={20} color={colors.primaryText} />}
            />
          </View>
          <View style={styles.buttonWrapperRight}>
            <Button
              variant="primary"
              onPress={handleReEstimate}
              disabled={!caNreEstimate || isReEstimating}
              icon={
                <SparkleIcon
                  size={20}
                  color={
                    !caNreEstimate || isReEstimating
                      ? colors.disabledText
                      : colors.white
                  }
                />
              }
            >
              {isReEstimating ? "estimating" : "Re-estimate"}
            </Button>
          </View>
        </Card>
      </KeyboardStickyView>
    </View>
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
      backgroundColor: colors.primaryBackground,
    },
    contentContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.lg,
      backgroundColor: colors.primaryBackground,
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
      padding: theme.spacing.sm,
      marginHorizontal: theme.spacing.md,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
  });
