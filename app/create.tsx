import { Toggle } from "@/components/shared/Toggle";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { Favorite, FoodLog } from "@/types/models";
import { useRouter } from "expo-router";
import { Sparkles, Camera, Mic } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from "react-native";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { useTranscription } from "@/hooks/useTranscription";
import { useImageSelection } from "@/hooks/useImageSelection";
import { useEstimation } from "@/hooks/useEstimation";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions";
import { LogCard } from "@/components/daily-food-logs";
import { generateFoodLogId } from "@/utils/idGenerator";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { AppText, Button } from "@/components/index";
import { SearchBar } from "@/components/shared/SearchBar/SearchBar";
import { TranscriptionOverlay } from "@/components/shared/TranscriptionOverlay";
import { TextInput } from "@/components/shared/TextInput";
import { DatePicker } from "@/components/shared/DatePicker";
import { formatDate } from "@/utils/formatDate";
import { RoundButton } from "@/components/shared/RoundButton";
import { X } from "lucide-react-native";

const inputAccessoryViewID = "create-input-accessory";

export default function Create() {
  const { colors, theme } = useTheme();
  const [estimationType, setEstimationType] = useState<
    "ai" | "favorites" | "manual"
  >("ai");
  const { selectedDate, favorites, deleteFavorite, addFoodLog } = useAppStore();
  const { startEstimation } = useEstimation();
  const [newLog, setNewLog] = useState<FoodLog>({
    id: "",
    title: "",
    description: "",
    supabaseImagePath: "",
    logDate: selectedDate,
    createdAt: new Date().toISOString(),
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    estimationConfidence: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    return favorites.filter(
      (favorite) =>
        favorite.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        favorite.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [favorites, searchQuery]);
  const styles = createStyles(colors, theme, !!newLog.supabaseImagePath);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const textInputRef = useRef<RNTextInput>(null);
  const estimateLabel = useMemo(() => {
    if (newLog.estimationConfidence && newLog.estimationConfidence > 0)
      return "Re-estimate";
    return "Estimate";
  }, [newLog.estimationConfidence]);

  useDelayedAutofocus(textInputRef);
  useEffect(() => {
    setNewLog({
      ...newLog,
      logDate: selectedDate,
    });
  }, [selectedDate]);

  const canContine =
    newLog?.description?.trim() !== "" || newLog.supabaseImagePath !== "";

  const { isRecording, liveTranscription, stopRecording, startRecording } =
    useTranscription();

  const handleTranscriptionStop = useCallback(async () => {
    if (liveTranscription.trim()) {
      setNewLog((prev) => ({
        ...prev,
        description:
          prev.description !== ""
            ? prev.description + " " + liveTranscription.trim()
            : liveTranscription.trim(),
      }));
    }
    await stopRecording();
  }, [liveTranscription, stopRecording]);

  const { back } = useRouter();
  const handleCancel = useCallback(() => {
    back();
  }, [back]);

  const { showImagePickerAlert } = useImageSelection({
    onImageSelected: (imageUrl: string) => {
      setNewLog((prev) => ({
        ...prev,
        supabaseImagePath: imageUrl,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        estimationConfidence: 0,
      }));
      setIsUploadingImage(false);
    },
    onUploadStart: () => {
      setIsUploadingImage(true);
    },
    onUploadError: () => {
      setIsUploadingImage(false);
    },
  });

  const handleEstimation = useCallback(() => {
    startEstimation({
      logDate: newLog.logDate,
      createdAt: newLog.createdAt,
      title: newLog.title,
      description: newLog.description,
      supabaseImagePath: newLog.supabaseImagePath,
    });
    back();
  }, [newLog, startEstimation, back]);

  const handleCreateLogFromFavorite = useCallback((favorite: Favorite) => {
    addFoodLog({
      ...favorite,
      logDate: selectedDate,
      createdAt: new Date().toISOString(),
      isEstimating: false,
      estimationConfidence: 100,
      id: generateFoodLogId(),
    });
    back();
  }, []);

  const formattedDate = formatDate(selectedDate);

  return (
    <GradientWrapper style={styles.container}>
      <View style={styles.toggleContainer}>
        <View style={styles.headerContainer}>
          <AppText role="Title2">{formattedDate}</AppText>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.sm,
            }}
          >
            <DatePicker buttonVariant="tertiary" />
            <RoundButton
              onPress={handleCancel}
              Icon={X}
              variant="tertiary"
              accessibilityLabel="Close create screen"
            />
          </View>
        </View>
        <Toggle
          value={estimationType}
          options={[
            { label: "Estimation", value: "ai" },
            { label: "Favorites", value: "favorites" },
            { label: "Manual", value: "manual" },
          ]}
          onChange={(value: "ai" | "favorites" | "manual") => {
            setEstimationType(value);
          }}
        />
        {estimationType === "favorites" && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search favorites"
          />
        )}
      </View>
      {estimationType === "ai" && (
        <KeyboardAwareScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          bottomOffset={250}
        >
          <View style={styles.content}>
            <ImageDisplay
              imageUrl={newLog.supabaseImagePath}
              isUploading={isUploadingImage}
            />
            <TextInput
              ref={textInputRef}
              value={newLog.description || ""}
              onChangeText={(text) =>
                setNewLog({ ...newLog, description: text })
              }
              placeholder="e.g. 100g of chicken breast"
              multiline={true}
              inputAccessoryViewID={inputAccessoryViewID}
              fontSize="Title2"
              style={styles.textInputContainer}
            />
          </View>
        </KeyboardAwareScrollView>
      )}

      {estimationType === "favorites" && (
        <ScrollView
          style={styles.favoritesScrollview}
          contentContainerStyle={[styles.contentContainer]}
          showsVerticalScrollIndicator={false}
        >
          {filteredFavorites.map((favorite) => (
            <SwipeToFunctions
              key={favorite.id}
              onDelete={() => deleteFavorite(favorite.id)}
              onTap={() => handleCreateLogFromFavorite(favorite)}
            >
              <LogCard key={favorite.id} foodLog={favorite} />
            </SwipeToFunctions>
          ))}
        </ScrollView>
      )}

      {estimationType === "ai" && (
        <KeyboardStickyView offset={{ closed: -30, opened: -10 }}>
          <View style={styles.keyboardAccessory}>
            <View style={styles.mediaActionContainer}>
              <RoundButton
                variant="tertiary"
                onPress={showImagePickerAlert}
                Icon={Camera}
              />
              <RoundButton
                variant="tertiary"
                onPress={startRecording}
                Icon={Mic}
              />
            </View>
            <Button
              variant="primary"
              label={estimateLabel}
              onPress={handleEstimation}
              disabled={!canContine}
              Icon={Sparkles}
            />
          </View>
        </KeyboardStickyView>
      )}

      <TranscriptionOverlay
        visible={isRecording}
        onStop={handleTranscriptionStop}
      />
    </GradientWrapper>
  );
}

const createStyles = (colors: Colors, theme: Theme, hasImage: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: theme.spacing.md,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing.lg,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: theme.spacing.sm,
    },
    toggleContainer: {
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    content: {
      flex: 1,
      gap: hasImage ? theme.spacing.md : theme.spacing.xl,
      marginHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
    },
    bottomContainer: {
      paddingBottom: theme.spacing.xl,
      backgroundColor: colors.secondaryBackground,
    },
    textInputContainer: {
      minHeight: 150,
    },
    favoritesScrollview: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.md,
      flex: 1,
    },
    contentContainer: {
      gap: theme.spacing.md,
    },
    keyboardAccessory: {
      marginHorizontal: theme.spacing.sm,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.spacing.sm,
      borderRadius: 16,
      padding: theme.spacing.sm,
      overflow: "hidden",
      zIndex: 99,
    },
    mediaActionContainer: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      justifyContent: "flex-end",
    },
  });
