import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  StyleSheet,
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
import { Calculator, Check } from "lucide-react-native";

import { AppText } from "@/components/index";
import { ComponentsList } from "@/components/refine-page/ComponentsList/ComponentsList";
import { MacrosCard } from "@/components/refine-page/MacrosCard/MacrosCard";
import { RecalculateButton } from "@/components/refine-page/RecalculateButton";
import { InlinePaywallCard } from "@/components/paywall/InlinePaywallCard";
import { TextInput } from "@/components/shared/TextInput";
import { useEstimation } from "@/hooks/useEstimation";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { makeSelectLogById } from "@/store/selectors";
import { useAppStore } from "@/store/useAppStore";
import type { FoodComponent } from "@/types/models";
import { Colors, Theme, useTheme } from "@/theme";
import { useEditableTitle } from "@/components/refine-page/hooks/useEditableTitle";
import { useEditChangeTracker } from "@/components/refine-page/hooks/useEditChangeTracker";
import { useEditedLog } from "@/components/refine-page/hooks/useEditedLog";
import { Host, Image } from "@expo/ui/swift-ui";

const easeLayout = Layout.duration(220).easing(Easing.inOut(Easing.quad));

export default function Edit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const originalLog = useAppStore(makeSelectLogById(id));
  const updateFoodLog = useAppStore((state) => state.updateFoodLog);
  const isPro = useAppStore((state) => state.isPro);
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
    editedLog,
    isDirty,
    replaceEditedLog,
    updateTitle,
    deleteComponent,
    acceptRecommendation,
  } = useEditedLog({
    logId: id,
    originalLog,
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
    title: editedLog?.title ?? "",
    onCommit: updateTitle,
  });

  const scrollRef = useRef<RNScrollView | null>(null);
  const [revealKey, setRevealKey] = useState(0);
  const previousLoadingRef = useRef<boolean>(isEditEstimating);

  useEffect(() => {
    previousLoadingRef.current = isEditEstimating;
  }, [isEditEstimating]);

  const titleChanged = draftTitle.trim() !== (originalLog?.title || "").trim();

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

  const handleShowPaywall = useCallback(() => {
    router.push("/paywall");
  }, [router]);

  const handleReestimate = useCallback(async () => {
    if (!editedLog) return;
    if (!isPro) {
      handleShowPaywall();
      return;
    }

    scrollRef.current?.scrollToEnd({ animated: true });

    try {
      await runEditEstimation(editedLog, (log) => {
        replaceEditedLog(log);
      });
      markReestimated();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRevealKey((key) => key + 1);
    } catch (error) {
      // Optional: silence for now; toasts handled elsewhere
    }
  }, [
    editedLog,
    isPro,
    handleShowPaywall,
    runEditEstimation,
    replaceEditedLog,
    markReestimated,
  ]);

  const commitTitleBeforeSave = useCallback(() => {
    commit();
  }, [commit]);

  const saveFoodLog = useCallback(() => {
    if (!id || !editedLog) return;

    const trimmedTitle = draftTitle.trim();
    updateFoodLog(id, {
      title: trimmedTitle,
      calories: editedLog.calories,
      protein: editedLog.protein,
      carbs: editedLog.carbs,
      fat: editedLog.fat,
      foodComponents: editedLog.foodComponents || [],
      macrosPerReferencePortion: editedLog.macrosPerReferencePortion,
      needsUserReview: editedLog.needsUserReview,
    });
    router.back();
  }, [draftTitle, editedLog, id, router, updateFoodLog]);

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
              saveFoodLog();
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

    saveFoodLog();
  }, [
    commitTitleBeforeSave,
    hasUnsavedChanges,
    hasReestimated,
    handleReestimate,
    saveFoodLog,
  ]);

  const doneDisabled =
    isEditEstimating ||
    Boolean(originalLog?.isEstimating) ||
    (!hasReestimated &&
      !isDirty &&
      !titleChanged &&
      !hasUnsavedChanges &&
      changesCount === 0);

  useEffect(() => {
    navigation.setOptions({
      headerBackTitle: "Home",
      headerRight: () => (
        <Pressable
          onPress={handleDone}
          disabled={doneDisabled}
          style={({ pressed }) => ({
            opacity: pressed && !doneDisabled ? 0.6 : 1,
            paddingLeft: 7,
          })}
          accessibilityLabel="Done"
        >
          <Host matchContents>
            <Image
              systemName={"checkmark"}
              color={doneDisabled ? "primary" : colors.accent}
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
    colors.secondaryText,
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
        {!editedLog ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <Animated.View layout={easeLayout}>
              <ComponentsList
                components={editedLog.foodComponents || []}
                onPressItem={handleOpenEditor}
                onDeleteItem={deleteComponent}
                onAddPress={handleAddComponent}
                onAcceptRecommendation={acceptRecommendation}
                disabled={
                  isEditEstimating || Boolean(originalLog?.isEstimating)
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
                    disabled={
                      isEditEstimating || Boolean(originalLog?.isEstimating)
                    }
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
                calories={editedLog.calories}
                protein={editedLog.protein}
                carbs={editedLog.carbs}
                fat={editedLog.fat}
                processing={isEditEstimating}
                wasProcessing={previousLoadingRef.current}
                revealKey={revealKey}
                hasUnsavedChanges={isPro ? hasUnsavedChanges : false}
                changesCount={changesCount}
                foodComponentsCount={editedLog.foodComponents?.length || 0}
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
  });
