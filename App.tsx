import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Animated,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useAudioRecorder, RecordingPresets, AudioModule } from "expo-audio";
import { supabase, estimateNutritionTextBased, estimateNutritionImageBased } from "./lib/supabase";
import { 
  FoodLog,
  getFoodLogs,
  saveFoodLog,
  updateFoodLog,
  deleteFoodLog,
  generateFoodLogId 
} from "./lib/storage";
import { SwipeToDelete } from "./components/SwipeToDelete";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const mergeNutritionData = (
  userCalories: string,
  userProtein: string,
  userCarbs: string,
  userFat: string,
  aiData?: { calories: number; protein: number; carbs: number; fat: number }
) => {
  const parseUserValue = (value: string, fieldName: string): { value: number | undefined; error: string | null } => {
    if (!value.trim()) {
      return { value: undefined, error: null };
    }

    const parsed = parseFloat(value.trim());
    
    if (isNaN(parsed)) {
      return { value: undefined, error: `${fieldName} must be a valid number` };
    }
    
    if (parsed < 0) {
      return { value: undefined, error: `${fieldName} cannot be negative` };
    }
    
    if (parsed > 10000) {
      return { value: undefined, error: `${fieldName} value seems too high (max 10,000)` };
    }

    return { value: parsed, error: null };
  };

  const caloriesResult = parseUserValue(userCalories, "Calories");
  const proteinResult = parseUserValue(userProtein, "Protein");
  const carbsResult = parseUserValue(userCarbs, "Carbs");
  const fatResult = parseUserValue(userFat, "Fat");

  // Collect all validation errors
  const errors = [
    caloriesResult.error,
    proteinResult.error,
    carbsResult.error,
    fatResult.error,
  ].filter(Boolean);

  const userValues = {
    calories: caloriesResult.value,
    protein: proteinResult.value,
    carbs: carbsResult.value,
    fat: fatResult.value,
  };

  // Check if user provided all nutrition values
  const hasAllUserValues = userValues.calories !== undefined && 
                           userValues.protein !== undefined && 
                           userValues.carbs !== undefined && 
                           userValues.fat !== undefined;

  return {
    // Final nutrition values (user input takes precedence)
    calories: userValues.calories ?? aiData?.calories ?? 0,
    protein: userValues.protein ?? aiData?.protein ?? 0,
    carbs: userValues.carbs ?? aiData?.carbs ?? 0,
    fat: userValues.fat ?? aiData?.fat ?? 0,
    // Store user-provided values separately
    userCalories: userValues.calories,
    userProtein: userValues.protein,
    userCarbs: userValues.carbs,
    userFat: userValues.fat,
    // Whether AI estimation is needed
    needsAiEstimation: !hasAllUserValues,
    // Validation results
    validationErrors: errors,
    isValid: errors.length === 0,
  };
};

export default function App() {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | "create">("edit");
  const [selectedLog, setSelectedLog] = useState<FoodLog | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [tempCalories, setTempCalories] = useState("");
  const [tempProtein, setTempProtein] = useState("");
  const [tempCarbs, setTempCarbs] = useState("");
  const [tempFat, setTempFat] = useState("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [pendingLogId, setPendingLogId] = useState<string | null>(null);

  // Load food logs from AsyncStorage on app start
  useEffect(() => {
    const loadFoodLogs = async () => {
      try {
        const logs = await getFoodLogs();
        setFoodLogs(logs);
      } catch (error) {
        console.error('Error loading food logs:', error);
        Alert.alert('Error', 'Failed to load food logs from storage');
      } finally {
        setIsLoadingLogs(false);
      }
    };

    loadFoodLogs();
  }, []);

  // Audio recording setup with expo-audio
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [showRecordingModal, setShowRecordingModal] = useState(false);

  const handleAddInfo = (log: FoodLog) => {
    setModalMode("edit");
    setSelectedLog(log);
    setTempTitle(log.userTitle || log.generatedTitle);
    setTempDescription(log.userDescription || "");
    setTempCalories(log.userCalories?.toString() || "");
    setTempProtein(log.userProtein?.toString() || "");
    setTempCarbs(log.userCarbs?.toString() || "");
    setTempFat(log.userFat?.toString() || "");
    setIsModalVisible(true);
  };

  const handleManualLog = () => {
    setModalMode("create");
    setSelectedLog(null);
    setTempTitle("");
    setTempDescription("");
    setTempCalories("");
    setTempProtein("");
    setTempCarbs("");
    setTempFat("");
    setIsModalVisible(true);
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      await deleteFoodLog(logId);
      // Update the local state to remove the deleted log
      setFoodLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
    } catch (error) {
      console.error('Error deleting food log:', error);
      Alert.alert('Error', 'Failed to delete food log. Please try again.');
    }
  };

  const handleSaveInfo = async () => {
    if (modalMode === "create") {
      // Validate required fields for create mode - title is optional for image logs
      const isImageLog = selectedLog?.imageUrl;
      if (!isImageLog && !tempTitle.trim()) {
        Alert.alert("Error", "Title is required");
        return;
      }

      setIsEstimating(true);
      
      let logToProcess: FoodLog;
      let logId: string;
      
      if (selectedLog) {
        // We're processing an existing log (image log)
        logId = selectedLog.id;
        logToProcess = selectedLog;
        setPendingLogId(null); // We don't need pending state for existing logs
      } else {
        // We're creating a completely new log (manual entry)
        logId = generateFoodLogId();
        setPendingLogId(logId);
        logToProcess = {
          id: logId,
          generatedTitle: "Estimating nutrition...",
          estimationConfidence: 0,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          createdAt: new Date().toISOString(),
        };
      }

      // Get nutrition data from user input and determine if AI estimation is needed
      const nutritionData = mergeNutritionData(tempCalories, tempProtein, tempCarbs, tempFat);

      // Validate nutrition input
      if (!nutritionData.isValid) {
        Alert.alert("Validation Error", nutritionData.validationErrors.join("\n"));
        setIsEstimating(false);
        setPendingLogId(null);
        return;
      }

      // Create updated log entry with loading state or final data
      const updatedLog: FoodLog = {
        ...logToProcess,
        userTitle: tempTitle.trim() || undefined,
        userDescription: tempDescription.trim() || undefined,
        generatedTitle: nutritionData.needsAiEstimation ? "Estimating nutrition..." : (tempTitle.trim() || logToProcess.generatedTitle),
        estimationConfidence: nutritionData.needsAiEstimation ? 0 : 100,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
        userCalories: nutritionData.userCalories,
        userProtein: nutritionData.userProtein,
        userCarbs: nutritionData.userCarbs,
        userFat: nutritionData.userFat,
      };

      // Update UI immediately
      if (selectedLog) {
        // Update existing log in the list
        setFoodLogs((prev) => prev.map(log => log.id === logId ? updatedLog : log));
      } else {
        // Add new log to the list
        setFoodLogs((prev) => [updatedLog, ...prev]);
      }
      
      // Close modal and clear state
      setIsModalVisible(false);
      setSelectedLog(null);
      setTempTitle("");
      setTempDescription("");
      setTempCalories("");
      setTempProtein("");
      setTempCarbs("");
      setTempFat("");

      try {
        let completeLog = updatedLog;

        if (nutritionData.needsAiEstimation) {
          // Call appropriate AI estimation API based on whether we have an image
          let estimation;
          if (updatedLog.imageUrl) {
            // Use image-based estimation
            estimation = await estimateNutritionImageBased({
              imageUrl: updatedLog.imageUrl,
              title: tempTitle.trim() || undefined,
              description: tempDescription.trim() || undefined,
            });
          } else {
            // Use text-based estimation - title is required for text-based estimation
            estimation = await estimateNutritionTextBased({
              title: tempTitle.trim(),
              description: tempDescription.trim() || undefined,
            });
          }

          // Merge AI data with user input (user input takes precedence)
          const mergedNutrition = mergeNutritionData(
            tempCalories, 
            tempProtein, 
            tempCarbs, 
            tempFat, 
            estimation
          );

          completeLog = {
            ...updatedLog,
            // Use user title if provided, otherwise use AI-generated title
            generatedTitle: tempTitle.trim() || estimation.generatedTitle,
            estimationConfidence: estimation.estimationConfidence,
            calories: mergedNutrition.calories,
            protein: mergedNutrition.protein,
            carbs: mergedNutrition.carbs,
            fat: mergedNutrition.fat,
            userCalories: mergedNutrition.userCalories,
            userProtein: mergedNutrition.userProtein,
            userCarbs: mergedNutrition.userCarbs,
            userFat: mergedNutrition.userFat,
          };
        }

        // Save to storage
        await saveFoodLog(completeLog);

        // Update UI with final data
        setFoodLogs((prevLogs) =>
          prevLogs.map((log) =>
            log.id === logId ? completeLog : log
          )
        );

      } catch (error) {
        console.error('Error estimating food:', error);
        
        // Handle error based on whether it's a new or existing log
        if (selectedLog) {
          // Revert to original log state for existing logs
          setFoodLogs((prevLogs) =>
            prevLogs.map((log) => log.id === logId ? selectedLog : log)
          );
        } else {
          // Remove new log on error
          setFoodLogs((prevLogs) =>
            prevLogs.filter((log) => log.id !== logId)
          );
        }
        
        // Show user-friendly error message
        Alert.alert(
          'Oops!', 
          'Something went wrong.'
        );
      } finally {
        setIsEstimating(false);
        setPendingLogId(null);
      }

    } else {
      // Edit mode - trigger AI re-estimation only when beneficial
      if (!selectedLog) return;

      // Get nutrition data from user input
      const nutritionData = mergeNutritionData(tempCalories, tempProtein, tempCarbs, tempFat);

      // Validate nutrition input
      if (!nutritionData.isValid) {
        Alert.alert("Validation Error", nutritionData.validationErrors.join("\n"));
        return;
      }

      // Check if re-estimation is needed - always re-estimate if new context is provided
      const hasNewContext = (tempTitle.trim() !== (selectedLog.userTitle || "")) || 
                            (tempDescription.trim() !== (selectedLog.userDescription || ""));
      const needsReEstimation = hasNewContext || (nutritionData.needsAiEstimation && selectedLog.estimationConfidence < 50);

      if (needsReEstimation) {
        setIsEstimating(true);
      }

      // Create updated log with loading state or final data
      const updatedLog: FoodLog = {
        ...selectedLog,
        userTitle: tempTitle.trim() || undefined,
        userDescription: tempDescription.trim() || undefined,
        userCalories: nutritionData.userCalories,
        userProtein: nutritionData.userProtein,
        userCarbs: nutritionData.userCarbs,
        userFat: nutritionData.userFat,
        // Set loading state only if we're doing re-estimation
        generatedTitle: needsReEstimation ? "Re-estimating nutrition..." : (tempTitle.trim() || selectedLog.generatedTitle),
        estimationConfidence: needsReEstimation ? 0 : (nutritionData.needsAiEstimation ? selectedLog.estimationConfidence : 100),
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
      };

      // Update UI immediately with loading state
      setFoodLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.id === selectedLog.id ? updatedLog : log
        )
      );

      // Close modal and clear state
      setIsModalVisible(false);
      setSelectedLog(null);
      setTempTitle("");
      setTempDescription("");
      setTempCalories("");
      setTempProtein("");
      setTempCarbs("");
      setTempFat("");

      try {
        let finalLog = updatedLog;

        if (needsReEstimation) {
          // Call appropriate AI estimation API based on whether we have an image
          let estimation;
          if (selectedLog.imageUrl) {
            // Use image-based estimation with updated context
            estimation = await estimateNutritionImageBased({
              imageUrl: selectedLog.imageUrl,
              title: tempTitle.trim() || undefined,
              description: tempDescription.trim() || undefined,
            });
          } else {
            // Use text-based estimation
            estimation = await estimateNutritionTextBased({
              title: tempTitle.trim() || selectedLog.generatedTitle,
              description: tempDescription.trim() || undefined,
            });
          }

          // Merge AI data with user input (user input takes precedence)
          const mergedNutrition = mergeNutritionData(
            tempCalories, 
            tempProtein, 
            tempCarbs, 
            tempFat, 
            estimation
          );

          finalLog = {
            ...updatedLog,
            generatedTitle: tempTitle.trim() || estimation.generatedTitle,
            estimationConfidence: estimation.estimationConfidence,
            calories: mergedNutrition.calories,
            protein: mergedNutrition.protein,
            carbs: mergedNutrition.carbs,
            fat: mergedNutrition.fat,
            userCalories: mergedNutrition.userCalories,
            userProtein: mergedNutrition.userProtein,
            userCarbs: mergedNutrition.userCarbs,
            userFat: mergedNutrition.userFat,
          };
        }

        // Save updated log to storage
        await updateFoodLog(finalLog);
        
        // Update UI with final data
        setFoodLogs((prevLogs) =>
          prevLogs.map((log) =>
            log.id === selectedLog.id ? finalLog : log
          )
        );

      } catch (error) {
        console.error('Error updating food log:', error);
        
        // Better error handling with more specific messages
        if (error instanceof Error && error.message === 'AI_ESTIMATION_FAILED') {
          Alert.alert(
            'AI Estimation Failed', 
            'Unable to re-estimate nutrition. Your manual changes have been saved.'
          );
          // Save the log without AI estimation
          try {
            await updateFoodLog(updatedLog);
            setFoodLogs((prevLogs) =>
              prevLogs.map((log) =>
                log.id === selectedLog.id ? updatedLog : log
              )
            );
          } catch (saveError) {
            console.error('Failed to save manual changes:', saveError);
            Alert.alert('Error', 'Failed to save changes. Please try again.');
            // Revert to original log on save error
            setFoodLogs((prevLogs) =>
              prevLogs.map((log) =>
                log.id === selectedLog.id ? selectedLog : log
              )
            );
          }
        } else {
          Alert.alert('Error', 'Failed to update food log. Please try again.');
          // Revert to original log on other errors
          setFoodLogs((prevLogs) =>
            prevLogs.map((log) =>
              log.id === selectedLog.id ? selectedLog : log
            )
          );
        }
      } finally {
        setIsEstimating(false);
      }
    }
  };

  const handleCancelInfo = () => {
    setIsModalVisible(false);
    setSelectedLog(null);
    setTempTitle("");
    setTempDescription("");
    setTempCalories("");
    setTempProtein("");
    setTempCarbs("");
    setTempFat("");
  };

  // Audio recording functions
  useEffect(() => {
    const requestAudioPermissions = async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert(
          "Permission Required",
          "Microphone access is needed to record audio"
        );
      }
    };
    requestAudioPermissions();
  }, []);

  useEffect(() => {
    if (showRecordingModal) {
      // Start pulse animation when recording
      const pulseAnimationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimationLoop.start();

      return () => {
        pulseAnimationLoop.stop();
      };
    } else {
      pulseAnimation.setValue(1);
    }
  }, [showRecordingModal]);

  const startAudioRecording = async () => {
    try {
      console.log("Starting audio recording...");
      setRecordingDuration(0);
      setHasRecorded(false);
      setShowRecordingModal(true);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      console.log("Recording started, isRecording:", audioRecorder.isRecording);
      console.log("Modal should be visible now");
    } catch (error) {
      console.error("Failed to start recording:", error);
      setShowRecordingModal(false);
      // @ts-ignore
      Alert.alert("Error", "Failed to start recording: " + error.message);
    }
  };

  const stopAudioRecording = async () => {
    try {
      console.log("Stopping audio recording...");
      setShowRecordingModal(false);
      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
        setHasRecorded(true);
        console.log("Recording stopped successfully");
      } else {
        console.warn("Attempted to stop recording when not recording");
        setHasRecorded(true); // Still show the send/cancel options
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      // @ts-ignore
      Alert.alert("Error", "Failed to stop recording: " + error.message);
    }
  };

  const sendAudioRecording = async () => {
    try {
      setIsProcessingAudio(true);

      // Note: Audio processing with OpenAI would go here
      // For now, create a placeholder log that suggests manual entry
      const newLog: FoodLog = {
        id: generateFoodLogId(),
        generatedTitle: "Audio recording - please add details",
        estimationConfidence: 20,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        createdAt: new Date().toISOString(),
      };

      await saveFoodLog(newLog);
      setFoodLogs((prev) => [newLog, ...prev]);

      // Reset audio recording state
      setHasRecorded(false);
      setRecordingDuration(0);
      
      Alert.alert(
        "Audio Recorded", 
        "Please tap 'Add Info' to add food details for better nutrition estimates."
      );
    } catch (error) {
      console.error("Error processing audio:", error);
      Alert.alert("Error", "Failed to process audio recording");
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const cancelAudioRecording = () => {
    setHasRecorded(false);
    setRecordingDuration(0);
    setShowRecordingModal(false);
  };

  // Safety function to reset recording state if stuck
  const resetRecordingState = async () => {
    try {
      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
      }
      setHasRecorded(false);
      setRecordingDuration(0);
      setIsProcessingAudio(false);
      setShowRecordingModal(false);
      console.log("Recording state reset");
    } catch (error) {
      console.error("Error resetting recording state:", error);
    }
  };

  const handleImageLog = async () => {
    try {
      setIsUploading(true);

      // Request camera permissions first
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.status !== "granted") {
        throw new Error("Camera permission not granted");
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return;

      const resizedImageUri = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1000 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const filename = `public/food-image-${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append("file", {
        uri: resizedImageUri.uri,
        name: filename,
        type: "image/jpeg",
      } as any);

      const { error: uploadError } = await supabase.storage
        .from("food-images")
        .upload(filename, formData);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from("food-images")
        .getPublicUrl(filename);

      const newLog: FoodLog = {
        id: generateFoodLogId(),
        generatedTitle: "Processing image...",
        estimationConfidence: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        imageUrl: publicUrlData.publicUrl,
        createdAt: new Date().toISOString(),
      };

      await saveFoodLog(newLog);
      setFoodLogs((prev) => [newLog, ...prev]);
      
      // Automatically open modal for user to add optional info
      setModalMode("create");
      setSelectedLog(newLog);
      setTempTitle("");
      setTempDescription("");
      setTempCalories("");
      setTempProtein("");
      setTempCarbs("");
      setTempFat("");
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error adding food log:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Food Logs</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoadingLogs ? (
          // Loading skeleton
          <View>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.logCard, styles.skeletonCard]}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonMacros}>
                  <View style={styles.skeletonMacro} />
                  <View style={styles.skeletonMacro} />
                  <View style={styles.skeletonMacro} />
                  <View style={styles.skeletonMacro} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          foodLogs.map((log) => (
            <SwipeToDelete
              key={log.id}
              itemId={log.id}
              onDelete={() => handleDeleteLog(log.id)}
            >
              <View style={styles.logCard}>
                <View style={styles.titleRow}>
                  <View style={styles.titleContent}>
                    <Text 
                      style={[
                        styles.logTitle,
                        log.estimationConfidence === 0 && styles.loadingTitle
                      ]}
                    >
                      {log.imageUrl && '📷 '}{log.userTitle || log.generatedTitle}
                    </Text>
                    {log.userDescription && (
                      <Text style={styles.logDescription}>
                        {log.userDescription}
                      </Text>
                    )}
                  </View>
                  <View style={styles.rightSection}>
                    {log.estimationConfidence === 0 ? (
                      <View style={[styles.confidenceText, styles.confidenceLoading]}>
                        <ActivityIndicator size="small" color="#6b7280" />
                      </View>
                    ) : (
                      <Text
                        style={[
                          styles.confidenceText,
                          log.estimationConfidence <= 30 && styles.confidenceLow,
                          log.estimationConfidence >= 31 &&
                            log.estimationConfidence <= 70 &&
                            styles.confidenceMedium,
                          log.estimationConfidence >= 71 && styles.confidenceHigh,
                        ]}
                      >
                        {log.estimationConfidence}%
                      </Text>
                    )}
                    <TouchableOpacity
                      style={styles.addInfoButton}
                      onPress={() => handleAddInfo(log)}
                    >
                      <Text style={styles.addInfoButtonText}>Add Info</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.macroRow}>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>P:</Text>
                    <Text style={styles.macroValue}>{log.protein}</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>C:</Text>
                    <Text style={styles.macroValue}>{log.carbs}</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>F:</Text>
                    <Text style={styles.macroValue}>{log.fat}</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>Cal:</Text>
                    <Text style={styles.macroValue}>{log.calories}</Text>
                  </View>
                </View>
              </View>
            </SwipeToDelete>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.manualEntryButton}
        onPress={handleManualLog}
      >
        <Text style={styles.manualEntryButtonText}>✎</Text>
      </TouchableOpacity>

      {/* Audio Recording Button */}
      {!hasRecorded && !isProcessingAudio && !showRecordingModal && (
        <TouchableOpacity
          style={styles.audioButton}
          onPress={startAudioRecording}
          activeOpacity={0.8}
        >
          <Text style={styles.audioButtonText}>🎤</Text>
        </TouchableOpacity>
      )}

      {/* Audio Recording Actions */}
      {hasRecorded && !isProcessingAudio && (
        <View style={styles.audioActionsContainer}>
          <TouchableOpacity
            style={styles.audioActionButton}
            onPress={cancelAudioRecording}
          >
            <Text style={styles.audioActionButtonText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.audioActionButton, styles.sendButton]}
            onPress={sendAudioRecording}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Emergency Reset - show if stuck in any recording state */}
      {(showRecordingModal || hasRecorded) && (
        <View style={styles.emergencyResetContainer}>
          <TouchableOpacity
            style={styles.emergencyResetButton}
            onPress={resetRecordingState}
          >
            <Text style={styles.emergencyResetText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Audio Processing State */}
      {isProcessingAudio && (
        <View style={styles.audioButton}>
          <View style={styles.audioButtonTouchable}>
            <ActivityIndicator color="#ffffff" size="small" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.addButton, isUploading && styles.addButtonDisabled]}
        onPress={handleImageLog}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.addButtonText}>📷</Text>
        )}
      </TouchableOpacity>

      {/* Recording Modal */}
      <Modal
        visible={showRecordingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={stopAudioRecording}
        supportedOrientations={["portrait"]}
        statusBarTranslucent={true}
      >
        <View style={styles.recordingModalOverlay}>
          <View style={styles.recordingModalContent}>
            <Animated.View
              style={[
                styles.recordingDot,
                { transform: [{ scale: pulseAnimation }] },
              ]}
            />
            <Text style={styles.recordingModalTitle}>Recording...</Text>
            <Text style={styles.recordingModalTimer}>00:00</Text>

            <TouchableOpacity
              style={styles.recordingStopButton}
              onPress={stopAudioRecording}
            >
              <Text style={styles.recordingStopButtonText}>⏹</Text>
            </TouchableOpacity>

            <Text style={styles.recordingModalHint}>Tap to stop recording</Text>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelInfo}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancelInfo}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {modalMode === "create" ? "Add Food Log" : "Add Info"}
            </Text>
            <TouchableOpacity onPress={handleSaveInfo}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedLog?.imageUrl && (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: selectedLog.imageUrl }} 
                  style={styles.foodImage}
                  resizeMode="cover"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Title{selectedLog?.imageUrl ? " (Optional)" : ""}
              </Text>
              <TextInput
                style={styles.textInput}
                value={tempTitle}
                onChangeText={setTempTitle}
                placeholder={selectedLog?.imageUrl ? "Enter food title (AI will generate if empty)" : "Enter food title"}
                multiline={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                value={tempDescription}
                onChangeText={setTempDescription}
                placeholder="Add details about preparation, ingredients, portion size, etc."
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.nutritionSection}>
              <Text style={styles.nutritionSectionTitle}>Nutrition (Optional)</Text>
              <Text style={styles.nutritionSectionSubtitle}>
                Leave fields empty to have AI estimate missing values
              </Text>
              
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionInputGroup}>
                  <Text style={styles.nutritionInputLabel}>Calories</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    value={tempCalories}
                    onChangeText={setTempCalories}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.nutritionInputGroup}>
                  <Text style={styles.nutritionInputLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    value={tempProtein}
                    onChangeText={setTempProtein}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.nutritionInputGroup}>
                  <Text style={styles.nutritionInputLabel}>Carbs (g)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    value={tempCarbs}
                    onChangeText={setTempCarbs}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.nutritionInputGroup}>
                  <Text style={styles.nutritionInputLabel}>Fat (g)</Text>
                  <TextInput
                    style={styles.nutritionInput}
                    value={tempFat}
                    onChangeText={setTempFat}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  logCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#f3f4f6",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContent: {
    flex: 1,
    marginRight: 12,
  },
  logTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  logDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 18,
    fontStyle: "italic",
  },
  rightSection: {
    alignItems: "flex-end",
    gap: 6,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  confidenceLow: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
  },
  confidenceMedium: {
    backgroundColor: "#fef3c7",
    color: "#d97706",
  },
  confidenceHigh: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
  },
  confidenceLoading: {
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingTitle: {
    color: "#9ca3af",
    fontStyle: "italic",
  },
  skeletonCard: {
    opacity: 0.6,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 12,
    width: "70%",
  },
  skeletonMacros: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#f3f4f6",
  },
  skeletonMacro: {
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: "20%",
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#f3f4f6",
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginRight: 4,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  manualEntryButton: {
    position: "absolute",
    bottom: 102,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#34D399",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#34D399",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  manualEntryButtonText: {
    fontSize: 24,
    fontWeight: "400",
    color: "#ffffff",
    lineHeight: 24,
  },
  addButton: {
    position: "absolute",
    bottom: 34,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowColor: "#9ca3af",
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: "300",
    color: "#ffffff",
    lineHeight: 28,
  },
  addInfoButton: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  addInfoButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalCancelButton: {
    fontSize: 16,
    color: "#6b7280",
  },
  modalSaveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#ffffff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  textInputMultiline: {
    height: 100,
  },
  nutritionSection: {
    marginBottom: 24,
  },
  nutritionSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  nutritionSectionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 18,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  nutritionInputGroup: {
    width: "48%",
    marginBottom: 16,
  },
  nutritionInputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  nutritionInput: {
    backgroundColor: "#ffffff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
    textAlign: "center",
  },
  // Audio recording styles
  audioButton: {
    position: "absolute",
    bottom: 170,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  audioButtonRecording: {
    backgroundColor: "#FF4444",
    shadowColor: "#FF4444",
  },
  audioButtonTouchable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
  },
  audioButtonText: {
    fontSize: 24,
    fontWeight: "400",
    color: "#ffffff",
    lineHeight: 24,
  },
  recordingIndicator: {
    position: "absolute",
    bottom: -35,
    left: -10,
    right: -10,
    alignItems: "center",
  },
  recordingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6B6B",
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  audioActionsContainer: {
    position: "absolute",
    bottom: 170,
    right: 24,
    flexDirection: "row",
    gap: 12,
  },
  audioActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#6b7280",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6b7280",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  audioActionButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  sendButton: {
    backgroundColor: "#22c55e",
    shadowColor: "#22c55e",
    paddingHorizontal: 4,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  processingText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#ffffff",
    marginTop: 2,
  },
  // Recording modal styles
  recordingModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 32,
    alignItems: "center",
    marginHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  recordingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF4444",
    marginBottom: 16,
  },
  recordingModalTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  recordingModalTimer: {
    fontSize: 32,
    fontWeight: "300",
    color: "#6b7280",
    marginBottom: 24,
    fontFamily: "monospace",
  },
  recordingModalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  recordingStopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FF4444",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingStopButtonText: {
    fontSize: 28,
    color: "#ffffff",
  },
  recordingModalHint: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "400",
    textAlign: "center",
  },
  // Emergency reset styles
  emergencyResetContainer: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  emergencyResetButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emergencyResetText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  // Image display styles
  imageContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  foodImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
});
