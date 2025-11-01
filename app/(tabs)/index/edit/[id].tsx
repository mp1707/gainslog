import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme, useTheme } from "@/theme";
import { useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import {
  ScrollView as RNScrollView,
  ScrollView,
} from "react-native-gesture-handler";
import { makeSelectLogById } from "@/store/selectors";
import type { FoodLog, FoodComponent } from "@/types/models";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEstimation } from "@/hooks/useEstimation";
import { useNavigation } from "@react-navigation/native";
import { MacrosCard } from "@/components/refine-page/MacrosCard/MacrosCard";
import { ComponentsList } from "@/components/refine-page/ComponentsList/ComponentsList";
import { AppText } from "@/components/index";
import { TextInput } from "@/components/shared/TextInput";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { InlinePaywallCard } from "@/components/paywall/InlinePaywallCard";
import { Calculator, Check } from "lucide-react-native";
import { RecalculateButton } from "@/components/refine-page/RecalculateButton";
import Animated, { Easing, Layout } from "react-native-reanimated";

const easeLayout = Layout.duration(220).easing(Easing.inOut(Easing.quad));

export default function Edit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const originalLog = useAppStore(makeSelectLogById(id));
  const updateFoodLog = useAppStore((s) => s.updateFoodLog);
  const isPro = useAppStore((s) => s.isPro);
  const isVerifyingSubscription = useAppStore((s) => s.isVerifyingSubscription);
  const pendingComponentEdit = useAppStore((s) => s.pendingComponentEdit);
  const clearPendingComponentEdit = useAppStore(
    (s) => s.clearPendingComponentEdit
  );
  const router = useSafeRouter();
  const navigation = useNavigation();

  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { runEditEstimation } = useEstimation();
  const scrollRef = useRef<RNScrollView | null>(null);

  // Local state to hold edits (do not mutate store until confirmed)
  const [editedLog, setEditedLog] = useState<FoodLog | undefined>(originalLog);
  const [isLoading, setIsLoading] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  // Track previous loading state for MacrosCard animations
  const previousLoadingRef = useRef<boolean>(isLoading);

  useEffect(() => {
    previousLoadingRef.current = isLoading;
  }, [isLoading]);
  // Snapshot of components at last successful estimation
  const [lastEstimatedComponents, setLastEstimatedComponents] = useState<
    FoodComponent[] | undefined
  >();
  const [hasReestimated, setHasReestimated] = useState(false);
  // Title editing state
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(editedLog?.title || "");

  // Change tracking for recalculation
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [changesCount, setChangesCount] = useState(0);
  // Track component-specific changes (not just title changes)
  const [hasComponentChanges, setHasComponentChanges] = useState(false);

  // Note: per-id modal, cleanup happens on unmount

  // Sync when originalLog loads or changes
  useEffect(() => {
    // Only sync from store when not locally editing/dirty
    if (!editedLog || !isDirty) {
      if (originalLog && originalLog.needsUserReview) {
        // If log needs review, immediately mark as reviewed in local state
        setEditedLog({ ...originalLog, needsUserReview: false });
        setIsDirty(true);
      } else {
        setEditedLog(originalLog);
      }
    }
  }, [originalLog, isDirty]);

  // Sync tempTitle with editedLog title
  useEffect(() => {
    if (editedLog && !isTitleEditing) {
      setTempTitle(editedLog.title || "");
    }
  }, [editedLog?.title, isTitleEditing]);

  // Check if title has changed
  const titleChanged = tempTitle.trim() !== (originalLog?.title || "").trim();

  const handleDone = () => {
    // Check if component changes were made without recalculation
    if (hasComponentChanges && !hasReestimated) {
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
              // Don't auto-save - let user review macros and manually press Done
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

    // No component changes or already recalculated - save directly
    saveFoodLog();
  };

  const saveFoodLog = () => {
    if (id && editedLog) {
      // Persist all updated values to the store
      updateFoodLog(id, {
        title: tempTitle.trim(),
        calories: editedLog.calories,
        protein: editedLog.protein,
        carbs: editedLog.carbs,
        fat: editedLog.fat,
        foodComponents: editedLog.foodComponents || [],
        macrosPerReferencePortion: editedLog.macrosPerReferencePortion,
        needsUserReview: editedLog.needsUserReview,
      });
    }
    router.back();
  };

  // Animated dimmer for editor overlay (defined above as dimAnimatedStyle)

  // Initialize baseline components once on first load to require a change before estimating
  useEffect(() => {
    if (editedLog && lastEstimatedComponents === undefined) {
      setLastEstimatedComponents([...(editedLog.foodComponents || [])]);
    }
  }, [editedLog, lastEstimatedComponents]);

  // Handlers for components editing
  const handleDeleteComponent = (index: number) => {
    setEditedLog((prev) => {
      if (!prev) return prev;
      const comps = (prev.foodComponents || []).filter((_, i) => i !== index);
      return { ...prev, foodComponents: comps };
    });
    setIsDirty(true);
    setHasUnsavedChanges(true);
    setChangesCount((prev) => prev + 1);
    setHasComponentChanges(true);
  };

  const handleOpenEditor = (index: number, component: FoodComponent) => {
    router.push(
      `/editComponent?mode=edit&index=${index}&name=${encodeURIComponent(
        component.name
      )}&amount=${component.amount}&unit=${component.unit}&logId=${id}`
    );
  };

  const handleAddComponent = () => {
    router.push(`/editComponent?mode=create&logId=${id}`);
  };

  const handleShowPaywall = useCallback(() => {
    router.push("/paywall");
  }, [router]);

  const handleReestimate = async () => {
    if (!editedLog) return;
    if (!isPro) {
      handleShowPaywall();
      return;
    }
    // Scroll to bottom when re-estimating to show macros section
    scrollRef.current?.scrollToEnd({ animated: true });
    setIsLoading(true);
    try {
      await runEditEstimation(editedLog, (log) => {
        setEditedLog(log);
        // Baseline set to the components as of the successful estimation result
        setLastEstimatedComponents([...(log.foodComponents || [])]);
      });
      setIsDirty(true); // local changes pending save
      setHasReestimated(true); // enable Done button

      // Reset change tracking after successful recalculation
      setHasUnsavedChanges(false);
      setChangesCount(0);
      setHasComponentChanges(false); // Clear component changes flag

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRevealKey((k) => k + 1);
    } catch (e) {
      // Optional: show error toast
    } finally {
      setIsLoading(false);
    }
  };

  // Title editing handlers
  const handleTitlePress = () => {
    setIsTitleEditing(true);
  };

  const handleTitleBlur = () => {
    setIsTitleEditing(false);
    if (editedLog) {
      setEditedLog({ ...editedLog, title: tempTitle.trim() });
      setIsDirty(true);
    }
  };

  // Accept recommendation handler
  const handleAcceptRecommendation = (
    index: number,
    component: FoodComponent
  ) => {
    if (!component.recommendedMeasurement) return;

    const { amount, unit } = component.recommendedMeasurement;
    const updatedComponent: FoodComponent = {
      ...component,
      amount,
      unit: unit as FoodComponent["unit"],
      recommendedMeasurement: undefined, // Clear recommendation after use
    };

    setEditedLog((prev) => {
      if (!prev) return prev;
      const comps = [...(prev.foodComponents || [])];
      comps[index] = updatedComponent;
      return { ...prev, foodComponents: comps };
    });

    setIsDirty(true);
    setHasUnsavedChanges(true);
    setChangesCount((prev) => prev + 1);
    setHasComponentChanges(true);
  };

  // Handle component saved/deleted from editor modal via store
  useEffect(() => {
    if (pendingComponentEdit && pendingComponentEdit.logId === id) {
      if (pendingComponentEdit.action === "save") {
        setEditedLog((prev) => {
          if (!prev) return prev;

          const comps = [...(prev.foodComponents || [])];
          if (pendingComponentEdit.index === "new") {
            comps.push(pendingComponentEdit.component);
          } else {
            comps[pendingComponentEdit.index] = pendingComponentEdit.component;
          }

          return { ...prev, foodComponents: comps };
        });

        setIsDirty(true);
        setHasUnsavedChanges(true);
        setChangesCount((prev) => prev + 1);
        setHasComponentChanges(true);
      } else if (pendingComponentEdit.action === "delete") {
        if (typeof pendingComponentEdit.index === "number") {
          handleDeleteComponent(pendingComponentEdit.index);
        }
      }

      // Clear immediately after processing
      clearPendingComponentEdit();
    }
  }, [pendingComponentEdit, id, clearPendingComponentEdit]);

  const doneDisabled =
    isLoading ||
    Boolean(originalLog?.isEstimating) ||
    (!hasReestimated &&
      !isDirty &&
      !titleChanged &&
      !hasUnsavedChanges &&
      changesCount === 0);

  // Configure native header with Done button
  useEffect(() => {
    navigation.setOptions({
      headerBackTitle: "Home",
      headerRight: () => (
        <Pressable
          onPress={handleDone}
          disabled={doneDisabled}
          style={({ pressed }) => ({
            opacity: pressed && !doneDisabled ? 0.6 : 1,
            paddingLeft: 5,
          })}
          accessibilityLabel="Done"
        >
          <Check
            size={24}
            color={doneDisabled ? colors.secondaryText : colors.accent}
            strokeWidth={2.5}
          />
        </Pressable>
      ),
    });
  }, [
    navigation,
    doneDisabled,
    handleDone,
    theme.spacing.md,
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
            value={tempTitle}
            onChangeText={setTempTitle}
            onBlur={handleTitleBlur}
            autoFocus={true}
            // blurOnSubmit={true}
            style={[styles.header, styles.titleInput]}
            placeholder="Enter title..."
            placeholderTextColor={colors.secondaryText}
          />
        ) : (
          <Pressable onPress={handleTitlePress}>
            <AppText role="Title2" style={styles.header}>
              {tempTitle || "Tap to add title"}
            </AppText>
          </Pressable>
        )}
        {!editedLog ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            {/* Editable component list */}
            <Animated.View layout={easeLayout}>
              <ComponentsList
                components={editedLog.foodComponents || []}
                onPressItem={handleOpenEditor}
                onDeleteItem={handleDeleteComponent}
                onAddPress={handleAddComponent}
                onAcceptRecommendation={handleAcceptRecommendation}
                disabled={isLoading || originalLog?.isEstimating}
              />
            </Animated.View>
            {/* Recalculate Button */}
            {isPro &&
              hasUnsavedChanges &&
              !isLoading &&
              !isVerifyingSubscription && (
                <Animated.View layout={easeLayout}>
                  <RecalculateButton
                    changesCount={changesCount}
                    onPress={handleReestimate}
                    disabled={isLoading || Boolean(originalLog?.isEstimating)}
                  />
                </Animated.View>
              )}
            {/* Paywall */}
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
            {/* Macros display */}
            <Animated.View layout={easeLayout}>
              <MacrosCard
                calories={editedLog.calories}
                protein={editedLog.protein}
                carbs={editedLog.carbs}
                fat={editedLog.fat}
                processing={isLoading}
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
      paddingTop: theme.spacing.xl, // Title spacing (72pt = 9×8)
      paddingBottom: theme.spacing.xl, // Bottom padding
      gap: theme.spacing.xl, // 24pt between sections
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
