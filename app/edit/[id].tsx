import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme, useTheme } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View, ActivityIndicator, Pressable } from "react-native";
import { ScrollView as RNScrollView } from "react-native-gesture-handler";
import { Check, X } from "lucide-react-native";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { makeSelectLogById } from "@/store/selectors";
import type { FoodLog, FoodComponent } from "@/types/models";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEstimation } from "@/hooks/useEstimation";
import { useNavigation } from "@react-navigation/native";
import { MacrosCard } from "@/components/refine-page/MacrosCard/MacrosCard";
import { ComponentsList } from "@/components/refine-page/ComponentsList/ComponentsList";
import { ComponentEditor } from "@/components/refine-page/ComponentEditor";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { AppText, Card } from "@/components/index";
import {
  BottomSheet,
  BottomSheetBackdrop,
} from "@/components/shared/BottomSheet";
import { TextInput } from "@/components/shared/TextInput";

export default function Edit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const originalLog = useAppStore(makeSelectLogById(id));
  const updateFoodLog = useAppStore((s) => s.updateFoodLog);
  const router = useRouter();

  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { runEditEstimation } = useEstimation();
  const scrollRef = useRef<RNScrollView | null>(null);

  // Local state to hold edits (do not mutate store until confirmed)
  const [editedLog, setEditedLog] = useState<FoodLog | undefined>(originalLog);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefined, setIsRefined] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  // Snapshot of components at last successful estimation
  const [lastEstimatedComponents, setLastEstimatedComponents] = useState<
    FoodComponent[] | undefined
  >();
  const [hasReestimated, setHasReestimated] = useState(false);
  // Title editing state
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(editedLog?.title || "");

  // Component editing state - simplified with two-state approach
  const [editingComponent, setEditingComponent] = useState<{
    index: number | "new";
    component: FoodComponent;
  } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Change tracking for recalculation
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [changesCount, setChangesCount] = useState(0);

  const navigation = useNavigation();

  // Note: per-id modal, cleanup happens on unmount

  // Sync when originalLog loads or changes
  useEffect(() => {
    // Only sync from store when not locally editing/dirty
    if (!editedLog || !isDirty) {
      setEditedLog(originalLog);
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
  };

  const handleOpenEditor = (index: number, component: FoodComponent) => {
    setEditingComponent({ index, component });
    setSheetOpen(true);
  };

  const handleAddComponent = () => {
    setEditingComponent({
      index: "new",
      component: { name: "", amount: 0, unit: "g" },
    });
    setSheetOpen(true);
  };

  const handleSaveComponent = (component: FoodComponent) => {
    if (!editingComponent) return;

    // Clear editing state immediately
    setEditingComponent(null);
    setSheetOpen(false);

    setEditedLog((prev) => {
      if (!prev) return prev;

      const comps = [...(prev.foodComponents || [])];
      if (editingComponent.index === "new") {
        comps.push(component);
      } else {
        comps[editingComponent.index] = component;
      }

      return { ...prev, foodComponents: comps };
    });

    setIsDirty(true);
    setHasUnsavedChanges(true);
    setChangesCount((prev) => prev + 1);
  };

  const handleCancelEdit = () => {
    // Clear editing state immediately
    setEditingComponent(null);
    setSheetOpen(false);
  };

  const handleReestimate = async () => {
    if (!editedLog) return;
    // Scroll to bottom when re-estimating to show macros section
    scrollRef.current?.scrollToEnd({ animated: true });
    setIsRefined(false);
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

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsRefined(true);
      setRevealKey((k) => k + 1);
      // Reset refined flag after brief celebration window
      setTimeout(() => setIsRefined(false), 1200);
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
  };

  // Dynamically disable modal swipe gesture when bottom sheet is open
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !sheetOpen,
    });
  }, [sheetOpen, navigation]);

  const doneDisabled =
    isLoading ||
    Boolean(originalLog?.isEstimating) ||
    (!hasReestimated &&
      !isDirty &&
      !titleChanged &&
      !hasUnsavedChanges &&
      changesCount === 0);

  return (
    <GradientWrapper style={styles.container}>
      <View style={styles.closeButtonLeft}>
        <RoundButton
          Icon={X}
          onPress={() => router.back()}
          variant={"tertiary"}
          accessibilityLabel="Close"
        />
      </View>
      <View style={styles.closeButton}>
        <RoundButton
          Icon={Check}
          onPress={handleDone}
          variant={"primary"}
          disabled={doneDisabled}
          accessibilityLabel="Close"
        />
      </View>
      <RNScrollView
        ref={scrollRef as any}
        style={[styles.scrollView]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
        scrollEnabled={!sheetOpen}
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
            <ComponentsList
              components={editedLog.foodComponents || []}
              onPressItem={handleOpenEditor}
              onDeleteItem={handleDeleteComponent}
              onAddPress={handleAddComponent}
              onAcceptRecommendation={handleAcceptRecommendation}
              disabled={isLoading || originalLog?.isEstimating}
            />
            {/* Macros display */}
            <MacrosCard
              calories={editedLog.calories}
              protein={editedLog.protein}
              carbs={editedLog.carbs}
              fat={editedLog.fat}
              processing={isLoading}
              revealKey={revealKey}
              hasUnsavedChanges={hasUnsavedChanges}
              changesCount={changesCount}
              foodComponentsCount={editedLog.foodComponents?.length || 0}
              onRecalculate={handleReestimate}
            />
          </>
        )}
      </RNScrollView>
      {/* Component Editor Bottom Sheet */}
      <BottomSheetBackdrop
        open={sheetOpen}
        onPress={() => {
          setSheetOpen(false);
          setEditingComponent(null);
        }}
        opacity={0.35}
      />
      <BottomSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditingComponent(null);
        }}
      >
        {editingComponent && (
          <ComponentEditor
            component={editingComponent.component}
            isAdding={editingComponent.index === "new"}
            onSave={handleSaveComponent}
            onCancel={handleCancelEdit}
          />
        )}
      </BottomSheet>
    </GradientWrapper>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    closeButtonLeft: {
      position: "absolute",
      top: theme.spacing.md,
      left: theme.spacing.md,
      zIndex: 15,
    },
    closeButton: {
      position: "absolute",
      top: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 15,
    },
    contentContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.xxl + theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    header: {
      paddingLeft: theme.spacing.sm,
    },
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
