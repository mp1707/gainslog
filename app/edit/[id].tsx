import { AppText } from "@/components/index";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Keyboard, StyleSheet, View, ActivityIndicator } from "react-native";
import { FoodLog } from "@/types/models";
import { useCallback, useState, useEffect, useMemo, useRef } from "react";
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
import { useCreationStore } from "@/store/useCreationStore";
import { useDraft } from "@/hooks/useDraft";

export default function Edit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { foodLogs } = useAppStore();
  const router = useRouter();
  const { startEditingDraft, clearDraft, updateDraft } = useCreationStore();
  const draft = useDraft(typeof id === "string" ? id : undefined);
  const originalLog = useMemo(
    () => foodLogs.find((log) => log.id === id),
    [foodLogs, id]
  );

  const [isReEstimating, setIsReEstimating] = useState(false);
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
  const { startReEstimation } = useEstimation();
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const isClosingRef = useRef(false);

  // Initialize/refresh the draft for this id
  useEffect(() => {
    if (originalLog) {
      startEditingDraft(originalLog);
    }
  }, [originalLog, startEditingDraft]);

  // Cleanup this draft on unmount
  useEffect(() => {
    return () => {
      if (id) clearDraft(String(id));
    };
  }, [id, clearDraft]);

  const cleanupOldImage = useCallback(async (imagePath: string) => {
    if (imagePath) {
      try {
        await FileSystem.deleteAsync(imagePath, { idempotent: true });
      } catch (error) {
        console.log("Error deleting old image:", error);
      }
    }
  }, []);

  const handleCancel = useCallback(() => {
    isClosingRef.current = true;
    if (router.canGoBack()) router.back();
  }, [router]);

  const handleImageSelected = useCallback(
    async (uri: string) => {
      if (!draft || !id) return;
      setIsProcessingImage(true);
      try {
        if (draft.localImagePath) {
          await cleanupOldImage(draft.localImagePath);
        }
        const { localImagePath, supabaseImagePath } = await processImage(uri);
        updateDraft(String(id), {
          localImagePath,
          supabaseImagePath,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          estimationConfidence: 0,
        });
      } catch (error) {
        showErrorToast("Error processing image", "Please try again.");
      } finally {
        setIsProcessingImage(false);
      }
    },
    [id, draft, updateDraft, cleanupOldImage]
  );

  const handleUpdateNutrition = useCallback(
    (field: keyof FoodLog, value: number) => {
      if (!id) return;
      updateDraft(String(id), { [field]: value } as Partial<FoodLog>);
    },
    [id, updateDraft]
  );

  const handleReEstimate = useCallback(async () => {
    if (!draft || !originalLog) return;
    setIsReEstimating(true);
    Keyboard.dismiss();
    try {
      let logToEstimate = draft;
      if (
        draft.localImagePath &&
        draft.localImagePath === originalLog.localImagePath
      ) {
        const newSupabaseImagePath = await uploadToSupabaseStorage(
          draft.localImagePath
        );
        logToEstimate = {
          ...draft,
          supabaseImagePath: newSupabaseImagePath,
        };
        updateDraft(String(draft.id), {
          supabaseImagePath: newSupabaseImagePath,
        });
      }
      startReEstimation(logToEstimate, (updatedLog) => {
        updateDraft(String(updatedLog.id), updatedLog);
        setIsReEstimating(false);
      });
    } catch (error) {
      console.log("Error during re-estimation:", error);
      setIsReEstimating(false);
    }
  }, [draft, originalLog, updateDraft, startReEstimation]);

  // Show loading spinner until both originalLog and draft exist
  if (!originalLog || !draft || isClosingRef.current) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryText} />
        </View>
      </GradientWrapper>
    );
  }

  const changesWereMade =
    draft.description !== originalLog.description ||
    draft.localImagePath !== originalLog.localImagePath;

  const canReEstimate =
    (changesWereMade && draft.description?.trim() !== "") ||
    (!!draft.localImagePath &&
      draft.localImagePath !== originalLog.localImagePath);

  const estimateLabel = isReEstimating ? "Estimating..." : "Re-estimate";

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
          imageUrl={draft.localImagePath}
          isUploading={isProcessingImage}
        />
        <View style={styles.section}>
          <AppText role="Headline">Title</AppText>
          <TextInput
            value={draft.title}
            onChangeText={(text) =>
              updateDraft(String(draft.id), { title: text })
            }
            placeholder="Enter title"
            style={styles.textInputContainer}
          />
        </View>
        <View style={styles.section}>
          <AppText role="Headline">Description</AppText>
          <TextInput
            value={draft.description}
            onChangeText={(text) =>
              updateDraft(String(draft.id), { description: text })
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
                estimationConfidence={draft.estimationConfidence}
              />
            )}
          </View>
          <NutritionEditCard
            log={draft}
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
          logId={String(draft.id)}
        />
      </KeyboardStickyView>
    </GradientWrapper>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBackground },
    scrollView: { flex: 1, paddingTop: theme.spacing.xxl + theme.spacing.md },
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
    section: { gap: theme.spacing.sm },
    sectionTitle: {
      gap: theme.spacing.sm,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
