import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ScrollView,
  ScrollView as RNScrollView,
} from "react-native-gesture-handler";
import Animated, { Easing, Layout } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { Calculator, Trash2 } from "lucide-react-native";

import { AppText } from "@/components/index";
import { ComponentsList } from "@/components/refine-page/ComponentsList/ComponentsList";
import { MacrosCard } from "@/components/refine-page/MacrosCard/MacrosCard";
import { RecalculateButton } from "@/components/refine-page/RecalculateButton";
import { InlinePaywallCard } from "@/components/paywall/InlinePaywallCard";
import { TextInput } from "@/components/shared/TextInput";
import { useEstimation } from "@/hooks/useEstimation";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { makeSelectFavoriteById } from "@/store/selectors";
import { useAppStore } from "@/store/useAppStore";
import type { FoodComponent } from "@/types/models";
import { Colors, Theme, useTheme } from "@/theme";
import { useEditableTitle } from "@/components/refine-page/hooks/useEditableTitle";
import { useEditChangeTracker } from "@/components/refine-page/hooks/useEditChangeTracker";
import { useEditedFavorite } from "@/components/refine-page/hooks/useEditedFavorite";
import { Host, Image } from "@expo/ui/swift-ui";
import { isLiquidGlassAvailable } from "expo-glass-effect";

const easeLayout = Layout.duration(220).easing(Easing.inOut(Easing.quad));

export default function EditFavorite() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const originalFavorite = useAppStore(makeSelectFavoriteById(id));
  const updateFavorite = useAppStore((state) => state.updateFavorite);
  const deleteFavorite = useAppStore((state) => state.deleteFavorite);
  const isPro = useAppStore((state) => state.isPro);
  const hasLiquidGlass = isLiquidGlassAvailable();
  const isVerifyingSubscription = useAppStore(
    (state) => state.isVerifyingSubscription
  );
  const pendingComponentEdit = useAppStore(
    (state) => state.pendingComponentEdit
  );
  const clearPendingComponentEdit = useAppStore(
    (state) => state.clearPendingComponentEdit
  );

  const router = useSafeRouter();
  const navigation = useNavigation();
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const {
    hasUnsavedChanges,
    changesCount,
    hasReestimated,
    markComponentChange,
    markReestimated,
  } = useEditChangeTracker();

  const { runEditEstimation, isEditEstimating } = useEstimation();

  const {
    editedFavorite,
    isDirty,
    replaceEditedFavorite,
    updateTitle,
    deleteComponent,
    acceptRecommendation,
  } = useEditedFavorite({
    favoriteId: id,
    originalFavorite,
    pendingComponentEdit,
    clearPendingComponentEdit,
    onComponentChange: markComponentChange,
  });

  const {
    isEditing: isTitleEditing,
    draftTitle,
    startEditing,
    handleChange,
    handleBlur,
    commit,
  } = useEditableTitle({
    title: editedFavorite?.title ?? "",
    onCommit: updateTitle,
  });

  const scrollRef = useRef<RNScrollView | null>(null);
  const [revealKey, setRevealKey] = useState(0);
  const previousLoadingRef = useRef<boolean>(isEditEstimating);

  useEffect(() => {
    previousLoadingRef.current = isEditEstimating;
  }, [isEditEstimating]);

  const titleChanged =
    draftTitle.trim() !== (originalFavorite?.title || "").trim();

  const handleOpenEditor = useCallback(
    (index: number, component: FoodComponent) => {
      router.push(
        `/editComponent?mode=edit&index=${index}&name=${encodeURIComponent(
          component.name
        )}&amount=${component.amount}&unit=${component.unit}&logId=${id}`
      );
    },
    [router, id]
  );

  const handleAddComponent = useCallback(() => {
    router.push(`/editComponent?mode=create&logId=${id}`);
  }, [router, id]);

  const handleDeleteFavorite = useCallback(() => {
    if (!id) return;

    Alert.alert(
      "Delete Favorite",
      "This will remove the favorite permanently.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteFavorite(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            router.back();
          },
        },
      ]
    );
  }, [deleteFavorite, id, router]);

  const handleShowPaywall = useCallback(() => {
    router.push("/paywall");
  }, [router]);

  const handleReestimate = useCallback(async () => {
    if (!editedFavorite) return;
    if (!isPro) {
      handleShowPaywall();
      return;
    }

    scrollRef.current?.scrollToEnd({ animated: true });

    try {
      await runEditEstimation(editedFavorite, (next) => {
        replaceEditedFavorite(next);
      });
      markReestimated();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRevealKey((key) => key + 1);
    } catch (error) {
      // Optional: silence for now; toasts handled elsewhere
    }
  }, [
    editedFavorite,
    isPro,
    handleShowPaywall,
    runEditEstimation,
    replaceEditedFavorite,
    markReestimated,
  ]);

  const commitTitleBeforeSave = useCallback(() => {
    commit();
  }, [commit]);

  const saveFavorite = useCallback(() => {
    if (!id || !editedFavorite) return;

    const trimmedTitle = draftTitle.trim();
    updateFavorite(id, {
      title: trimmedTitle,
      calories: editedFavorite.calories,
      protein: editedFavorite.protein,
      carbs: editedFavorite.carbs,
      fat: editedFavorite.fat,
      foodComponents: editedFavorite.foodComponents || [],
      macrosPerReferencePortion: editedFavorite.macrosPerReferencePortion,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [draftTitle, editedFavorite, id, router, updateFavorite]);

  const handleDone = useCallback(() => {
    commitTitleBeforeSave();

    if (hasUnsavedChanges && !hasReestimated) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Unsaved Changes to Ingredients",
        "You've modified ingredients without recalculating macros. The nutrition values may be inaccurate.",
        [
          {
            text: "Recalculate Macros",
            style: "default",
            onPress: async () => {
              await handleReestimate();
            },
          },
          {
            text: "Save Anyway",
            style: "default",
            onPress: () => {
              saveFavorite();
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
      return;
    }
    saveFavorite();
  }, [
    commitTitleBeforeSave,
    hasUnsavedChanges,
    hasReestimated,
    handleReestimate,
    saveFavorite,
  ]);

  const doneDisabled =
    isEditEstimating ||
    (!hasReestimated &&
      !isDirty &&
      !titleChanged &&
      !hasUnsavedChanges &&
      changesCount === 0);

  useEffect(() => {
    navigation.setOptions({
      headerBackTitle: "Favorites",
      headerRight: () => (
        <Pressable
          onPress={handleDone}
          disabled={doneDisabled}
          style={{ padding: 8 }}
          accessibilityLabel="Done"
        >
          <Host matchContents>
            <Image
              systemName={"checkmark"}
              color={doneDisabled ? colors.disabledText : colors.accent}
              size={18}
            />
          </Host>
        </Pressable>
      ),
    });
  }, [
    navigation,
    handleDone,
    doneDisabled,
    colors.secondaryBackground,
    colors.disabledText,
    colors.accent,
  ]);

  return (
    <ScrollView style={styles.container}>
      <RNScrollView
        ref={scrollRef as any}
        style={[styles.scrollView]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
      >
        {isTitleEditing ? (
          <TextInput
            value={draftTitle}
            onChangeText={handleChange}
            onBlur={handleBlur}
            autoFocus
            style={[styles.header, styles.titleInput]}
            placeholder="Enter title..."
            placeholderTextColor={colors.secondaryText}
          />
        ) : (
          <Pressable onPress={startEditing}>
            <AppText role="Title2" style={styles.header}>
              {draftTitle || "Tap to add title"}
            </AppText>
          </Pressable>
        )}
        {!editedFavorite ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <Animated.View layout={easeLayout}>
              <ComponentsList
                components={editedFavorite.foodComponents || []}
                onPressItem={handleOpenEditor}
                onDeleteItem={deleteComponent}
                onAddPress={handleAddComponent}
                onAcceptRecommendation={acceptRecommendation}
                disabled={isEditEstimating}
                headerAction={
                  <TouchableOpacity
                    onPress={handleDeleteFavorite}
                    style={styles.deleteFavoriteButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Delete Favorite"
                  >
                    <Trash2 size={18} color={colors.error} />
                    <AppText
                      style={[
                        styles.deleteFavoriteLabel,
                        { color: colors.error },
                      ]}
                    >
                      Delete Favorite
                    </AppText>
                  </TouchableOpacity>
                }
              />
            </Animated.View>

            {isPro &&
              hasUnsavedChanges &&
              !isEditEstimating &&
              !isVerifyingSubscription && (
                <Animated.View layout={easeLayout}>
                  <RecalculateButton
                    changesCount={changesCount}
                    onPress={handleReestimate}
                    disabled={isEditEstimating}
                  />
                </Animated.View>
              )}

            <Animated.View layout={easeLayout}>
              {isVerifyingSubscription ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator />
                </View>
              ) : (
                !isPro && (
                  <InlinePaywallCard
                    Icon={Calculator}
                    title="Recalculate with Pro"
                    body="Get updated macros when you adjust ingredients."
                    ctaLabel="Unlock to Recalculate"
                    onPress={handleShowPaywall}
                    testID="edit-inline-paywall"
                  />
                )
              )}
            </Animated.View>

            <Animated.View layout={easeLayout}>
              <MacrosCard
                calories={editedFavorite.calories}
                protein={editedFavorite.protein}
                carbs={editedFavorite.carbs}
                fat={editedFavorite.fat}
                processing={isEditEstimating}
                wasProcessing={previousLoadingRef.current}
                revealKey={revealKey}
                hasUnsavedChanges={isPro ? hasUnsavedChanges : false}
                changesCount={changesCount}
                foodComponentsCount={editedFavorite.foodComponents?.length || 0}
              />
            </Animated.View>
          </>
        )}
      </RNScrollView>
    </ScrollView>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    scrollView: { flex: 1 },
    contentContainer: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.xl,
    },
    header: {},
    titleInput: {
      color: colors.primaryText,
      fontSize: theme.typography.Title2.fontSize,
      fontWeight: "600",
    },
    bottomSheet: {
      borderRadius: theme.components.cards.cornerRadius,
      backgroundColor: colors.secondaryBackground,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.xl,
    },
    deleteFavoriteButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
    },
    deleteFavoriteLabel: {
      fontSize: theme.typography.Body.fontSize,
      fontWeight: "600",
    },
  });
