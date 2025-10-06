import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme, useTheme } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Pressable,
} from "react-native";
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
import { ConfidenceCard } from "@/components/refine-page/ConfidenceCard/ConfidenceCard";
import { MacrosCard } from "@/components/refine-page/MacrosCard/MacrosCard";
import { ComponentsList } from "@/components/refine-page/ComponentsList/ComponentsList";
import { ComponentEditor } from "@/components/refine-page/ComponentEditor";
import { FloatingAction } from "@/components/refine-page/FloatingAction/FloatingAction";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { AppText } from "@/components/index";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { TextInput } from "@/components/shared/TextInput";
import { getRefinementInfoDetailed } from "@/utils/getRefinementInfo";

const deriveConfidenceLevel = (confidence?: number): 0 | 1 | 2 | 3 => {
  if (!confidence) return 0;

  const normalized = Math.min(100, Math.max(0, Math.floor(confidence)));

  if (normalized >= 76) return 3;
  if (normalized >= 50) return 2;
  if (normalized >= 30) return 1;
  return 0;
};

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

  const sheetRef = useRef<BottomSheet | null>(null);
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

  // Confidence UI is handled inside ConfidenceCard component

  const handleDone = () => {
    if (id && editedLog) {
      // Persist all updated values to the store
      updateFoodLog(id, {
        title: tempTitle.trim(),
        calories: editedLog.calories,
        protein: editedLog.protein,
        carbs: editedLog.carbs,
        fat: editedLog.fat,
        estimationConfidence: editedLog.estimationConfidence,
        foodComponents: editedLog.foodComponents || [],
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

  // Track if components have changed relative to last successful estimation
  const componentsChangedSinceLastEstimate = useMemo(() => {
    const baseline = lastEstimatedComponents ?? [];
    const curr = editedLog?.foodComponents ?? [];

    if (baseline.length !== curr.length) return true;

    // Quick reference check first
    if (baseline === curr) return false;

    for (let i = 0; i < baseline.length; i++) {
      const o = baseline[i];
      const c = curr[i];
      if (o === c) continue; // Same reference, skip
      if (o.name !== c.name) return true;
      if (o.amount !== c.amount) return true;
      if (o.unit !== c.unit) return true;
      if (o.needsRefinement !== c.needsRefinement) return true;
    }
    return false;
  }, [lastEstimatedComponents, editedLog?.foodComponents]);

  const estimationConfidence = editedLog?.estimationConfidence ?? 0;
  const confidenceLevel = useMemo(
    () => deriveConfidenceLevel(estimationConfidence),
    [estimationConfidence]
  );
  const confidenceInfoSubText = useMemo(
    () =>
      editedLog?.foodComponents &&
      getRefinementInfoDetailed(editedLog.foodComponents),
    [editedLog?.foodComponents]
  );

  const isConfidenceLoading = isLoading || !!originalLog?.isEstimating;

  // Handlers for components editing
  const handleDeleteComponent = (index: number) => {
    setEditedLog((prev) => {
      if (!prev) return prev;
      const comps = (prev.foodComponents || []).filter((_, i) => i !== index);
      return { ...prev, foodComponents: comps };
    });
    setIsDirty(true);
  };

  const handleMarkComponentOk = (index: number) => {
    setEditedLog((prev) => {
      if (!prev) return prev;
      const comps = [...(prev.foodComponents || [])];
      const existing = comps[index];
      if (existing) {
        comps[index] = { ...existing, needsRefinement: false };
      }
      return { ...prev, foodComponents: comps };
    });
    setIsDirty(true);
  };

  const handleOpenEditor = (index: number, component: FoodComponent) => {
    setEditingComponent({ index, component });
    setSheetOpen(true);
  };

  const handleAddComponent = () => {
    setEditingComponent({
      index: "new",
      component: { name: "", amount: 0, unit: "g", needsRefinement: false },
    });
    setSheetOpen(true);
  };

  const handleSaveComponent = (component: FoodComponent) => {
    if (!editingComponent) return;

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
    // Use ref method to close sheet
    sheetRef.current?.close();
  };

  const handleCancelEdit = () => {
    // Use ref method to close sheet
    sheetRef.current?.close();
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

  // Dynamically disable modal swipe gesture when bottom sheet is open
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !sheetOpen,
    });
  }, [sheetOpen, navigation]);

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
          disabled={!hasReestimated && !isDirty && !titleChanged}
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
              onMarkOk={handleMarkComponentOk}
              disabled={isLoading || originalLog?.isEstimating}
            />
            <ConfidenceCard
              confidenceLevel={confidenceLevel}
              infoSubText={confidenceInfoSubText}
              isLoading={isConfidenceLoading}
            />
            {/* Macros display */}
            <MacrosCard
              calories={editedLog.calories}
              protein={editedLog.protein}
              carbs={editedLog.carbs}
              fat={editedLog.fat}
              processing={isConfidenceLoading}
              revealKey={revealKey}
            />

            {/* Image display (like on create) */}
            <ImageDisplay
              imageUrl={editedLog.localImagePath}
              isUploading={false}
            />
          </>
        )}
      </RNScrollView>
      {/* Bottom Sheet Editor */}
      <BottomSheet
        ref={sheetRef as any}
        index={sheetOpen ? 0 : -1}
        snapPoints={["50%"]}
        enableDynamicSizing={false}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={{
          backgroundColor: colors.secondaryBackground,
        }}
        onChange={(index) => {
          if (index === -1) {
            // Sheet fully closed, update state and clear editing
            setSheetOpen(false);
            setEditingComponent(null);
          } else if (index === 0) {
            // Sheet opened, update state
            setSheetOpen(true);
          }
        }}
        handleIndicatorStyle={{
          backgroundColor: colors.secondaryText,
          width: 40,
          height: 4,
          borderRadius: 2,
        }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            opacity={0.35}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
      >
        {editingComponent && (
          <BottomSheetView style={{ flex: 1 }}>
            <ComponentEditor
              component={editingComponent.component}
              isAdding={editingComponent.index === "new"}
              onSave={handleSaveComponent}
              onCancel={handleCancelEdit}
            />
          </BottomSheetView>
        )}
      </BottomSheet>
      {!sheetOpen && editedLog && (
        <FloatingAction
          onPress={handleReestimate}
          disabled={
            isLoading ||
            originalLog?.isEstimating ||
            lastEstimatedComponents === undefined ||
            !componentsChangedSinceLastEstimate ||
            (editedLog.foodComponents?.length || 0) === 0
          }
          isProcessing={isLoading || !!originalLog?.isEstimating}
          didSucceed={isRefined}
        />
      )}
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
      paddingBottom: theme.spacing.xxl * 2,
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
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.xl,
    },
  });
