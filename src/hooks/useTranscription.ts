import { useState, useCallback, useEffect } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

export interface UseTranscriptionReturn {
  requestPermission: () => Promise<boolean>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  liveTranscription: string;
  volumeLevel: number;
  isRecording: boolean;
  isPreparing: boolean;
}

export const useTranscription = (): UseTranscriptionReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState("");
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Event handlers
  const handleStart = useCallback(() => {
    setIsPreparing(false);
    setIsRecording(true);
  }, []);

  const handleEnd = useCallback(() => {
    setLiveTranscription("");
    setIsRecording(false);
    setIsPreparing(false);
  }, []);

  const handleResult = useCallback((event: any) => {
    if (event.results && event.results.length > 0) {
      const latestResult = event.results[event.results.length - 1];
      const transcription = latestResult.transcript.trim();
      setLiveTranscription(transcription);
    }
  }, []);

  const handleError = useCallback((event: any) => {
    // i don't want to spam the console with errors, just because the user didnt speak
    // console.error("Speech recognition error:", event.error);
    // setIsRecording(false);
    // setLiveTranscription("");
  }, []);

  const handleVolumeChange = useCallback((event: any) => {
    // Map decibel values (-2 to 10+) to 0-100 scale
    const dbValue = event.value || -2;
    // Map -2 dB (silent) to 0%, 10 dB (loud) to 100%
    const normalizedVolume = Math.round(
      Math.max(0, Math.min(100, (dbValue + 2) * 8.33))
    );
    setVolumeLevel(normalizedVolume);
  }, []);

  // Register event listeners
  useSpeechRecognitionEvent("start", handleStart);
  useSpeechRecognitionEvent("end", handleEnd);
  useSpeechRecognitionEvent("result", handleResult);
  useSpeechRecognitionEvent("error", handleError);
  useSpeechRecognitionEvent("volumechange", handleVolumeChange);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      return permission.granted;
    } catch (error) {
      console.error("Error requesting speech recognition permission:", error);
      return false;
    }
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      // Set preparing state immediately for instant UI feedback
      setIsPreparing(true);

      // Clear previous state
      setLiveTranscription("");
      setVolumeLevel(0);

      // Start recognition with volume metering enabled
      ExpoSpeechRecognitionModule.start({
        lang: "de-DE",
        interimResults: true,
        maxAlternatives: 1,
        continuous: true,
        volumeChangeEventOptions: {
          enabled: true,
          intervalMillis: 100, // Update volume every 100ms for smoother updates
        },
      });
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setIsRecording(false);
      setIsPreparing(false);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<void> => {
    try {
      ExpoSpeechRecognitionModule.stop();
      setVolumeLevel(0);
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
      setIsRecording(false);
      setIsPreparing(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        ExpoSpeechRecognitionModule.stop();
      }
    };
  }, [isRecording]);

  return {
    requestPermission,
    startRecording,
    stopRecording,
    liveTranscription,
    volumeLevel,
    isRecording,
    isPreparing,
  };
};
