import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { Toggle } from "@/components/shared/Toggle";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { Favorite, FoodLog } from "@/types/models";
import { useRouter } from "expo-router";
import { SparkleIcon, CameraIcon, MicrophoneIcon } from "phosphor-react-native";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from "react-native";
import { useAudioTranscription } from "@/hooks/useAudioTranscription";
import { useImageSelection } from "@/hooks/useImageSelection";
import { useEstimation } from "@/hooks/useEstimation";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions";
import { LogCard } from "@/components/daily-food-logs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { generateFoodLogId } from "@/utils/idGenerator";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { Card } from "@/components/Card";
import { Button } from "@/components/index";
import { SearchBar } from "@/components/shared/SearchBar/SearchBar";
import { TranscriptionOverlay } from "@/components/shared/TranscriptionOverlay";
import { TextInput } from "@/components/shared/TextInput";

const inputAccessoryViewID = "create-input-accessory";

export default function Create() {
  const { colors, theme, colorScheme } = useTheme();
  const [estimationType, setEstimationType] = useState<
    "ai" | "favorites" | "manual"
  >("ai");
  const { selectedDate, favorites, deleteFavorite, addFoodLog } = useAppStore();
  const { startEstimation } = useEstimation();
  const [newLog, setNewLog] = useState<FoodLog>({
    id: "",
    title: "",
    description: "",
    imageUrl: "",
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
  const styles = createStyles(colors, theme, !!newLog.imageUrl);
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
    newLog?.description?.trim() !== "" || newLog.imageUrl !== "";

  // Audio transcription hook
  const handleTranscriptionComplete = useCallback((text: string) => {
    setNewLog((prev) => ({
      ...prev,
      description:
        prev.description !== "" ? prev.description + " " + text : text,
    }));
  }, []);

  const { isRecording, liveTranscription, toggleRecording, startRecording } =
    useAudioTranscription({
      onTranscriptionComplete: handleTranscriptionComplete,
      initialValue: "",
      disabled: false,
    });

  const { back } = useRouter();
  const handleCancel = useCallback(() => {
    back();
  }, [back]);

  const { showImagePickerAlert } = useImageSelection({
    onImageSelected: (imageUrl: string) => {
      setNewLog((prev) => ({
        ...prev,
        imageUrl,
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
      imageUrl: newLog.imageUrl,
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

  return (
    <View style={styles.container}>
      <ModalHeader
        onCancel={handleCancel}
        onSave={handleEstimation}
        disabled={!canContine}
      />
      <View style={styles.toggleContainer}>
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
              imageUrl={newLog.imageUrl}
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
        <GestureHandlerRootView style={{ flex: 1 }}>
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
        </GestureHandlerRootView>
      )}

      {estimationType === "ai" && (
        <KeyboardStickyView offset={{ closed: -30, opened: -10 }}>
          <Card style={styles.keyboardAccessory}>
            <View style={styles.buttonWrapperLeft}>
              <Button
                variant="secondary"
                onPress={showImagePickerAlert}
                icon={<CameraIcon size={20} color={colors.primaryText} />}
              />
            </View>
            <View style={styles.buttonWrapperCenter}>
              <Button
                variant="secondary"
                onPress={startRecording}
                icon={<MicrophoneIcon size={20} color={colors.primaryText} />}
              />
            </View>
            <View style={styles.buttonWrapperRight}>
              <Button
                variant="primary"
                onPress={handleEstimation}
                disabled={!canContine}
                icon={
                  <SparkleIcon
                    size={20}
                    color={canContine ? colors.white : colors.disabledText}
                  />
                }
              >
                {estimateLabel}
              </Button>
            </View>
          </Card>
        </KeyboardStickyView>
      )}

      {estimationType === "favorites" && (
        <KeyboardStickyView offset={{ closed: -30, opened: -10 }}>
          <Card style={styles.keyboardAccessory}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search favorites"
            />
          </Card>
        </KeyboardStickyView>
      )}

      <TranscriptionOverlay
        visible={isRecording}
        liveTranscription={liveTranscription}
        onStop={toggleRecording}
      />
    </View>
  );
}

const createStyles = (colors: Colors, theme: Theme, hasImage: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing.lg,
    },
    toggleContainer: {
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.md,
      gap: theme.spacing.lg,
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
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.md,
      flex: 1,
    },
    contentContainer: {
      gap: theme.spacing.md,
    },
    keyboardAccessory: {
      padding: theme.spacing.sm,
      marginHorizontal: theme.spacing.md,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    buttonWrapperLeft: {
      flex: 1,
    },
    buttonWrapperCenter: {
      flex: 1,
    },
    buttonWrapperRight: {
      flex: 2,
    },
  });
