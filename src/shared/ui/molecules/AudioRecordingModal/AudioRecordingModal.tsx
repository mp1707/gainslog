import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  useAudioRecorder,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
} from "expo-audio";
import * as FileSystem from "expo-file-system";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { createStyles } from "./AudioRecordingModal.styles";
import { useTheme } from "../../../../providers/ThemeProvider";

type RecordingState =
  | "preparing"
  | "recording"
  | "transcribing";

interface AudioRecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onTranscriptionStart?: () => void;
  onTranscriptionComplete: (transcribedText: string) => void;
}

export function AudioRecordingModal({
  visible,
  onClose,
  onTranscriptionStart,
  onTranscriptionComplete,
}: AudioRecordingModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recordingState, setRecordingState] =
    useState<RecordingState>("preparing");
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const pulseAnimation = useSharedValue(1);
  const isTranscribing = useRef(false);

  // Speech recognition event listeners
  useSpeechRecognitionEvent("result", (event) => {
    if (!isTranscribing.current) return;

    if (event.results && event.results.length > 0) {
      const transcription = event.results
        .map((result) => result.transcript)
        .join(" ")
        .trim();

      if (transcription) {
        onTranscriptionComplete(transcription);
        handleCompleteCleanup();
        isTranscribing.current = false;
      }
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (!isTranscribing.current) return;

    console.error("Speech recognition error:", event.error);
    
    // Handle specific error types
    let errorMessage = "Transcription failed. Please try again.";
    let errorTitle = "Transcription Error";
    
    if (event.error === "no-speech") {
      errorTitle = "No Speech Detected";
      errorMessage = "No speech was detected in your recording. Please try recording again and speak clearly into the microphone.";
    } else if (event.error === "audio-capture") {
      errorTitle = "Audio Recording Error";
      errorMessage = "There was a problem with the audio recording. Please try again.";
    } else if (event.error === "not-allowed") {
      errorTitle = "Permission Denied";
      errorMessage = "Speech recognition permission was denied. Please enable it in your device settings.";
    } else if (event.error === "network") {
      errorTitle = "Network Error";
      errorMessage = "Network connection is required for transcription. Please check your internet connection.";
    }
    
    Alert.alert(errorTitle, errorMessage);
    handleCompleteCleanup();
    onClose();
    isTranscribing.current = false;
  });

  useSpeechRecognitionEvent("end", () => {
    if (!isTranscribing.current) return;

    // If we ended without getting results, it's likely no speech was detected
    if (recordingState === "transcribing") {
      Alert.alert(
        "No Speech Detected", 
        "The transcription ended without detecting any speech. Please try recording again and speak clearly into the microphone.",
        [
          { 
            text: "Try Again", 
            onPress: () => {
              handleCompleteCleanup();
              onClose();
            }
          }
        ]
      );
    }
    isTranscribing.current = false;
  });

  // Auto-start recording when modal opens and cleanup on close
  useEffect(() => {
    if (visible) {
      startRecording();
    } else {
      handleResourceCleanup();
    }
  }, [visible]);

  // Recording timer - only start when actually recording
  useEffect(() => {
    // Clear any existing timer first
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }

    // Only start timer when actually recording (not preparing)
    if (recordingState === "recording") {
      recordingTimer.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    };
  }, [recordingState]);

  // Pulse animation for recording state
  useEffect(() => {
    if (recordingState === "recording") {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
    } else {
      pulseAnimation.value = withTiming(1, { duration: 300 });
    }
  }, [recordingState]);

  const animatedRecordingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnimation.value }],
    };
  });

  const startRecording = async () => {
    try {
      setRecordingState("preparing");
      setRecordingTime(0);

      // Request permissions using expo-audio
      const permission = await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow microphone access to record audio.",
          [{ text: "OK", onPress: onClose }]
        );
        return;
      }

      // Set audio mode for recording
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      await audioRecorder.record();

      // Only set recording state after everything is ready
      setRecordingState("recording");
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
      setRecordingState("preparing");
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (uri) {
        setRecordedUri(uri);
        setRecordingState("transcribing");
        await startTranscription(uri);
      } else {
        Alert.alert("Error", "Failed to save recording. Please try again.");
        onClose();
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      Alert.alert("Error", "Failed to stop recording. Please try again.");
      onClose();
    }
  };

  const handleResourceCleanup = async () => {
    try {
      // Stop any active recording
      if (recordingState === "recording") {
        await audioRecorder.stop();
      }

      // Delete recorded file if it exists
      if (recordedUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(recordedUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(recordedUri);
          }
        } catch (deleteError) {
          console.warn("Failed to delete audio file:", deleteError);
        }
      }

      // Clear timer
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      // Stop pulse animation
      pulseAnimation.value = 1;
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  };

  const handleCompleteCleanup = async () => {
    await handleResourceCleanup();

    // Reset all state
    setRecordingState("preparing");
    setRecordingTime(0);
    setRecordedUri(null);
    isTranscribing.current = false;
  };

  const startTranscription = async (uri: string) => {
    try {
      isTranscribing.current = true;

      // Basic audio file validation
      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists || fileInfo.size === 0) {
          Alert.alert(
            "Invalid Recording", 
            "The audio recording appears to be empty or corrupted. Please try recording again."
          );
          onClose();
          isTranscribing.current = false;
          return;
        }
        
        // Log for debugging
        console.log("Audio file info:", { 
          exists: fileInfo.exists, 
          size: fileInfo.size, 
          uri: uri 
        });
      } catch (fileError) {
        console.warn("Could not validate audio file:", fileError);
        // Continue anyway, as file validation might fail on some platforms
      }

      // Notify parent that transcription is starting
      if (onTranscriptionStart) {
        onTranscriptionStart();
      }

      // Request speech recognition permissions
      const permission =
        await ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow speech recognition access to transcribe audio."
        );
        onClose();
        return;
      }

      // Start transcription
      await ExpoSpeechRecognitionModule.start({
        audioSource: {
          uri: uri,
        },
        interimResults: false,
        maxAlternatives: 1,
        continuous: false,
        lang: "de-DE",
      });
    } catch (error) {
      console.error("Error starting transcription:", error);
      Alert.alert("Transcription Error", "Failed to start transcription. Please try again.");
      onClose();
      isTranscribing.current = false;
    }
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const renderRecordingControls = () => {
    switch (recordingState) {
      case "preparing":
        return (
          <View style={styles.controlsContainer}>
            <View style={styles.recordingButton}>
              <FontAwesome name="microphone" size={32} color="white" />
            </View>
            <Text style={styles.recordingText}>Preparing...</Text>
          </View>
        );

      case "recording":
        return (
          <View style={styles.controlsContainer}>
            <Animated.View
              style={[styles.recordingButton, animatedRecordingStyle]}
            >
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopRecording}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Stop recording"
              >
                <FontAwesome name="stop" size={24} color="white" />
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.recordingInfo}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording</Text>
              </View>
              <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
            </View>
          </View>
        );

      case "transcribing":
        return (
          <View style={styles.controlsContainer}>
            <View style={styles.recordingButton}>
              <FontAwesome name="cog" size={32} color="white" />
            </View>
            <Text style={styles.recordingText}>Transcribing audio...</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={async () => {
        await handleResourceCleanup();
        onClose();
      }}
    >
      <StatusBar style="light" />
      <Pressable
        style={styles.backdrop}
        onPress={async () => {
          await handleResourceCleanup();
          onClose();
        }}
      >
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.content}>{renderRecordingControls()}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
