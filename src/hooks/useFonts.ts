import { useEffect, useState } from "react";
import * as Font from "expo-font";

const fontMap = {
  "Nunito-Regular": require("../../assets/fonts/Nunito-Regular.ttf"),
  "Nunito-SemiBold": require("../../assets/fonts/Nunito-SemiBold.ttf"),
  "Nunito-Bold": require("../../assets/fonts/Nunito-Bold.ttf"),
};

export interface UseFontsResult {
  fontsLoaded: boolean;
  error: string | null;
}

export const useFonts = (): UseFontsResult => {
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFonts = async (): Promise<void> => {
      try {
        await Font.loadAsync(fontMap);
        setFontsLoaded(true);
      } catch (err) {
        console.error("Error loading fonts:", err);
        setError(err instanceof Error ? err.message : "Font loading failed");
        // Set fontsLoaded to true even on error to allow app to continue with fallback fonts
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  return { fontsLoaded, error };
};
