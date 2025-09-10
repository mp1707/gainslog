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

export default function Edit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { foodLogs } = useAppStore();
  const router = useRouter();
  const { pendingLog, startEditingLog, clearPendingLog, updatePendingLog } =
    useCreationStore();
  const originalLog = useMemo(
    () => foodLogs.find((log) => log.id === id),
    [foodLogs, id]
  );

  const [isReEstimating, setIsReEstimating] = useState(false);
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
  const { startReEstimation } = useEstimation();
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const initializedLogId = useRef<string | null>(null);
  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ++ FIX: SPLIT INTO TWO USEEFFECTS

  // Effect 1: Reset initialization when URL ID parameter changes
  useEffect(() => {
    if (id && initializedLogId.current && initializedLogId.current !== id) {
      // URL changed to different log ID, reset initialization
      initializedLogId.current = null;
      // Clear any pending recovery timeout
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
        recoveryTimeoutRef.current = null;
      }
    }
  }, [id]);

  // Effect 2: Synchronizes the store with the current log based on the URL ID.
  // This runs only when the originalLog changes, not when pendingLog updates.
  useEffect(() => {
    if (originalLog && initializedLogId.current !== originalLog.id) {
      startEditingLog(originalLog);
      initializedLogId.current = originalLog.id;
      
      // Clear any pending recovery timeout since we're syncing properly
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
        recoveryTimeoutRef.current = null;
      }
    }
  }, [originalLog]);

  // Effect 3: Recovery mechanism for race conditions
  useEffect(() => {
    // If we have originalLog but pendingLog doesn't match, set up recovery timeout
    if (originalLog && (!pendingLog || pendingLog.id !== originalLog.id)) {
      // Clear any existing timeout
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
      
      // Force sync after 500ms if still mismatched
      recoveryTimeoutRef.current = setTimeout(() => {
        console.log('[Edit] Recovery timeout triggered, forcing store sync');
        startEditingLog(originalLog);
        initializedLogId.current = originalLog.id;
        recoveryTimeoutRef.current = null;
      }, 500);
    } else if (pendingLog && originalLog && pendingLog.id === originalLog.id) {
      // Clear recovery timeout if sync is successful
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
        recoveryTimeoutRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
        recoveryTimeoutRef.current = null;
      }
    };
  }, [originalLog, pendingLog, startEditingLog]);

  // Effect 2: Handles cleanup ONCE when the component truly unmounts.
  // The empty dependency array [] ensures this effect's cleanup only runs on unmount.
  useEffect(() => {
    return () => {
      clearPendingLog();
    };
  }, []); // <-- Empty array is crucial here!

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
    router.back();
  }, [router]);

  const handleImageSelected = useCallback(
    async (uri: string) => {
      if (!pendingLog) return;
      setIsProcessingImage(true);
      try {
        if (pendingLog.localImagePath) {
          await cleanupOldImage(pendingLog.localImagePath);
        }
        const { localImagePath, supabaseImagePath } = await processImage(uri);
        updatePendingLog({
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
    [pendingLog, updatePendingLog, cleanupOldImage]
  );

  const handleUpdateNutrition = useCallback(
    (field: keyof FoodLog, value: number) => {
      updatePendingLog({ [field]: value } as Partial<FoodLog>);
    },
    [updatePendingLog]
  );

  const handleReEstimate = useCallback(async () => {
    if (!pendingLog || !originalLog) return;
    setIsReEstimating(true);
    Keyboard.dismiss();
    try {
      let logToEstimate = pendingLog;
      if (
        pendingLog.localImagePath &&
        pendingLog.localImagePath === originalLog.localImagePath
      ) {
        const newSupabaseImagePath = await uploadToSupabaseStorage(
          pendingLog.localImagePath
        );
        logToEstimate = {
          ...pendingLog,
          supabaseImagePath: newSupabaseImagePath,
        };
        updatePendingLog({ supabaseImagePath: newSupabaseImagePath });
      }
      startReEstimation(logToEstimate, (updatedLog) => {
        updatePendingLog(updatedLog);
        setIsReEstimating(false);
      });
    } catch (error) {
      console.log("Error during re-estimation:", error);
      setIsReEstimating(false);
    }
  }, [pendingLog, originalLog, updatePendingLog, startReEstimation]);

  // Show loading spinner while store is syncing (prevents white screen)
  if (!originalLog || !pendingLog || pendingLog.id !== originalLog.id) {
    return (
      <GradientWrapper style={styles.container}>
        <View style={styles.closeButton}>
          <RoundButton
            Icon={X}
            onPress={() => router.back()}
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
    pendingLog.description !== originalLog.description ||
    pendingLog.localImagePath !== originalLog.localImagePath;

  const canReEstimate =
    (changesWereMade && pendingLog.description?.trim() !== "") ||
    (!!pendingLog.localImagePath &&
      pendingLog.localImagePath !== originalLog.localImagePath);

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
          imageUrl={pendingLog.localImagePath}
          isUploading={isProcessingImage}
        />
        <View style={styles.section}>
          <AppText role="Headline">Title</AppText>
          <TextInput
            value={pendingLog.title}
            onChangeText={(text) => updatePendingLog({ title: text })}
            placeholder="Enter title"
            style={styles.textInputContainer}
          />
        </View>
        <View style={styles.section}>
          <AppText role="Headline">Description</AppText>
          <TextInput
            value={pendingLog.description}
            onChangeText={(text) => updatePendingLog({ description: text })}
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
                estimationConfidence={pendingLog.estimationConfidence}
              />
            )}
          </View>
          <NutritionEditCard
            log={pendingLog}
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
          logId={id}
          source="edit"
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
