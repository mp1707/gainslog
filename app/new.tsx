import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from "react-native";
import type { ListRenderItem } from "react-native";
import * as Haptics from "expo-haptics";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { BrainCircuit, Info } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/theme/ThemeProvider";
import type { ColorScheme, Colors, Theme } from "@/theme";
import type { Favorite } from "@/types/models";
import { useTranscription } from "@/hooks/useTranscription";
import { useEstimation } from "@/hooks/useEstimation";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { HeaderButton } from "@/components/shared/HeaderButton";
import { showErrorToast } from "@/lib/toast";
import { processImage } from "@/utils/processImage";
import { useCreationStore } from "@/store/useCreationStore";
import { useDraft } from "@/hooks/useDraft";
import { generateFoodLogId } from "@/utils/idGenerator";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { InlinePaywallCard } from "@/components/paywall/InlinePaywallCard";
import { TextInput } from "@/components/shared/TextInput";
import { AppText } from "@/components/shared/AppText";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { FavoritePreviewCard } from "@/components/create-page/FavoritePreviewCard/FavoritePreviewCard";
import { KeyboardAccessory } from "@/components/create-page/KeyboardAccessory/KeyboardAccessory";

const inputAccessoryViewID = "create-input-accessory";
const CARD_WIDTH = Dimensions.get("window").width * 0.4;

export default function Create() {
  const router = useSafeRouter();
  const { theme, colors, colorScheme } = useTheme();
  const styles = useMemo(
    () => createStyles(theme, colors, colorScheme),
    [theme, colors, colorScheme]
  );
  const isIOS = Platform.OS === "ios";
  const insets = useSafeAreaInsets();

  const { startNewDraft, clearDraft, updateDraft } = useCreationStore();
  const [draftId, setDraftId] = useState<string | null>(null);
  const draft = useDraft(draftId);
  const favorites = useAppStore((state) => state.favorites);
  const { selectedDate, addFoodLog } = useAppStore();
  const isPro = useAppStore((state) => state.isPro);
  const isVerifyingSubscription = useAppStore(
    (state) => state.isVerifyingSubscription
  );
  const { runCreateEstimation } = useEstimation();
  const {
    requestPermission,
    isRecording,
    isTransitioning,
    liveTranscription,
    volumeLevel,
    stopRecording,
    startRecording,
  } = useTranscription();

  const baseDescriptionRef = useRef<string | null>(null);
  const lastAppliedTranscriptionRef = useRef<string | null>(null);
  const wasRecordingRef = useRef(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const textInputRef = useRef<RNTextInput>(null);
  useDelayedAutofocus(textInputRef);

  useEffect(() => {
    const id = startNewDraft(selectedDate);
    setDraftId(id);
    return () => {
      clearDraft(id);
    };
  }, [startNewDraft, clearDraft, selectedDate]);

  // Trigger haptic when recording actually starts
  useEffect(() => {
    if (isRecording) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      textInputRef.current?.focus();
    }
  }, [isRecording]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenExplainer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/explainer-ai-estimation");
  }, [router]);

  const handleShowPaywall = useCallback(() => {
    router.push("/paywall");
  }, [router]);

  const handleEstimation = useCallback(() => {
    if (!draft || !isPro || isEstimating) {
      if (!isPro) {
        handleShowPaywall();
      }
      return;
    }
    setIsEstimating(true);
    runCreateEstimation(draft);
    router.back();
  }, [
    draft,
    isPro,
    isEstimating,
    runCreateEstimation,
    router,
    handleShowPaywall,
  ]);

  const handleCreateLogFromFavorite = useCallback(
    (favorite: Favorite) => {
      addFoodLog({
        ...favorite,
        logDate: selectedDate,
        createdAt: new Date().toISOString(),
        isEstimating: false,
        needsUserReview: false,
        id: generateFoodLogId(),
      });
      router.back();
    },
    [addFoodLog, selectedDate, router]
  );

  const handleDescriptionChange = useCallback(
    (description: string) => {
      if (!draftId) return;
      lastAppliedTranscriptionRef.current = null;
      updateDraft(draftId, { description });
    },
    [draftId, updateDraft]
  );

  const handleNewImageSelected = useCallback(
    async (uri: string) => {
      if (!draftId) return;
      setIsProcessingImage(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      try {
        const { localImagePath, supabaseImagePath } = await processImage(uri);
        updateDraft(draftId, {
          localImagePath,
          supabaseImagePath,
          pendingImageUri: undefined,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        });
        textInputRef.current?.focus();
      } catch (error) {
        showErrorToast("Error processing image", "Please try again.");
      } finally {
        setIsProcessingImage(false);
      }
    },
    [draftId, updateDraft]
  );

  const handleRemoveImage = useCallback(() => {
    if (!draftId) return;
    updateDraft(draftId, {
      localImagePath: undefined,
      supabaseImagePath: undefined,
      pendingImageUri: undefined,
    });
    textInputRef.current?.focus();
  }, [draftId, updateDraft]);

  useEffect(() => {
    if (draft?.pendingImageUri) {
      handleNewImageSelected(draft.pendingImageUri);
    }
  }, [draft?.pendingImageUri, handleNewImageSelected]);

  useEffect(() => {
    if (!draft) return;

    if (isRecording && !wasRecordingRef.current) {
      const currentDescription = draft.description ?? "";
      baseDescriptionRef.current = currentDescription;
      lastAppliedTranscriptionRef.current = currentDescription;
    }

    if (!isRecording && wasRecordingRef.current) {
      baseDescriptionRef.current = null;
      lastAppliedTranscriptionRef.current = null;
    }

    wasRecordingRef.current = isRecording;
  }, [isRecording, draft]);

  useEffect(() => {
    if (!draft || !isRecording) return;
    const base = baseDescriptionRef.current
      ? baseDescriptionRef.current.trim()
      : "";
    const interim = liveTranscription.trim();
    const merged = [base, interim].filter(Boolean).join(" ");

    if (merged === lastAppliedTranscriptionRef.current) {
      return;
    }

    if ((draft.description ?? "") === merged) {
      lastAppliedTranscriptionRef.current = merged;
      return;
    }

    lastAppliedTranscriptionRef.current = merged;
    updateDraft(draft.id, { description: merged });
  }, [draft, isRecording, liveTranscription, updateDraft]);

  const handleTranscriptionStop = useCallback(async () => {
    await stopRecording();
    baseDescriptionRef.current = null;
    lastAppliedTranscriptionRef.current = null;
  }, [stopRecording]);

  const filteredFavorites = useMemo(() => {
    if (!favorites.length) return [] as Favorite[];
    const query = (draft?.description ?? "").trim().toLowerCase();
    if (!query) return favorites;

    return favorites.filter((favorite) => {
      const haystack = `${favorite.title} ${
        favorite.description ?? ""
      }`.toLowerCase();
      return haystack.includes(query);
    });
  }, [favorites, draft?.description]);

  const renderFavoriteCard = useCallback<ListRenderItem<Favorite>>(
    ({ item }) => (
      <FavoritePreviewCard
        favorite={item}
        onPress={() => handleCreateLogFromFavorite(item)}
        width={CARD_WIDTH}
      />
    ),
    [handleCreateLogFromFavorite]
  );

  const canContinue =
    (draft?.description?.trim() !== "" || !!draft?.localImagePath) &&
    !isEstimating;

  if (!draft) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.headerContainer,
          { paddingTop: insets.top + theme.spacing.sm },
        ]}
      >
        <Pressable
          onPress={handleOpenExplainer}
          style={({ pressed }) => [
            styles.headerInfoButton,
            pressed && styles.headerInfoButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Learn how to get the best AI estimates"
        >
          <AppText
            role="Title1"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.headerTitle}
          >
            Describe your meal
          </AppText>
          <Info size={20} color={colors.accent} />
        </Pressable>
        <HeaderButton
          buttonProps={{
            onPress: handleCancel,
            color: colors.secondaryBackground,
          }}
          imageProps={{
            systemName: "xmark",
            color: colors.primaryText,
          }}
        />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={isIOS ? "interactive" : "on-drag"}
      >
        {isVerifyingSubscription ? (
          <View style={styles.centerContent}>
            <ActivityIndicator />
          </View>
        ) : !isPro ? (
          <View style={styles.paywallContainer}>
            <InlinePaywallCard
              Icon={BrainCircuit}
              title="AI Logging is a Pro Feature"
              body="Log meals effortlessly with a photo, text, or your voice."
              ctaLabel="Start Free Trial"
              onPress={handleShowPaywall}
              testID="create-inline-paywall"
            />
          </View>
        ) : (
          <View style={styles.content}>
            <TextInput
              ref={textInputRef}
              value={draft.description || ""}
              onChangeText={handleDescriptionChange}
              placeholder="e.g. 100g of chicken breast"
              multiline
              inputAccessoryViewID={inputAccessoryViewID}
              fontSize="Headline"
              style={styles.textInputField}
              containerStyle={styles.textInputContainer}
              focusBorder={false}
              accessibilityLabel="Describe your meal"
            />
            {!(draft.localImagePath || isProcessingImage) && (
              <View style={styles.favoritesSection}>
                <AppText role="Caption" style={styles.heading}>
                  {filteredFavorites.length > 0
                    ? " Favorites"
                    : "No favorites found"}
                </AppText>
                {filteredFavorites.length > 0 && (
                  <View style={styles.favoritesListOffsetFix}>
                    <FlatList
                      horizontal
                      data={filteredFavorites}
                      renderItem={renderFavoriteCard}
                      keyExtractor={(item) => item.id}
                      ItemSeparatorComponent={() => (
                        <View style={styles.favoriteSeparator} />
                      )}
                      showsHorizontalScrollIndicator={false}
                      contentInset={{ left: theme.spacing.sm }}
                      contentContainerStyle={styles.favoritesListContent}
                    />
                  </View>
                )}
              </View>
            )}
            {(draft.localImagePath || isProcessingImage) && (
              <View style={styles.imageSection}>
                <AppText role="Caption" style={styles.heading}>
                  Your image
                </AppText>
                <ImageDisplay
                  imageUrl={draft.localImagePath}
                  isUploading={isProcessingImage}
                  deleteImage={handleRemoveImage}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <KeyboardStickyView offset={{ closed: -54, opened: 0 }}>
        <KeyboardAccessory
          textInputRef={textInputRef}
          requestMicPermission={requestPermission}
          onRecording={startRecording}
          onStopRecording={handleTranscriptionStop}
          onEstimate={handleEstimation}
          canContinue={canContinue}
          isEstimating={isEstimating}
          isRecording={isRecording}
          isTransitioning={isTransitioning}
          volumeLevel={volumeLevel}
          logId={draft.id}
        />
      </KeyboardStickyView>
    </View>
  );
}

const createStyles = (theme: Theme, colors: Colors, colorScheme: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colorScheme === "dark"
          ? colors.primaryBackground
          : colors.tertiaryBackground,
    },
    headerContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerInfoButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      flexShrink: 1,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
    },
    headerInfoButtonPressed: {
      opacity: 0.6,
    },
    headerTitle: {
      color: colors.primaryText,
      flexShrink: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xxl,
      paddingTop: theme.spacing.lg,
      flexGrow: 1,
    },
    content: {
      gap: theme.spacing.lg,
      flexGrow: 1,
    },
    textInputContainer: {
      paddingHorizontal: theme.spacing.lg,
    },
    textInputField: {},
    favoritesSection: {
      gap: theme.spacing.sm,
    },
    favoritesListOffsetFix: {
      marginTop: -theme.spacing.xl,
    },
    heading: {
      color: colors.secondaryText,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      paddingHorizontal: theme.spacing.lg,
    },
    favoritesListContent: {
      paddingVertical: theme.spacing.xl,
      paddingRight: theme.spacing.xl,
      paddingLeft: theme.spacing.sm,
    },
    favoriteSeparator: {
      width: theme.spacing.sm,
    },
    imageSection: {
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      flex: 1,
    },
    paywallContainer: {
      flex: 1,
      justifyContent: "center",
      paddingBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },
    centerContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.primaryBackground,
    },
  });
