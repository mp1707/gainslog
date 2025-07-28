import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

const fontMap = {
  'Nunito-Regular': require('../../assets/fonts/Nunito-Regular.ttf'),
  'Nunito-SemiBold': require('../../assets/fonts/Nunito-SemiBold.ttf'),
  'Nunito-Bold': require('../../assets/fonts/Nunito-Bold.ttf'),
};

export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync(fontMap);
        setFontsLoaded(true);
      } catch (err) {
        console.error('Error loading fonts:', err);
        setError(err instanceof Error ? err.message : 'Font loading failed');
        // Set fontsLoaded to true even on error to allow app to continue with fallback fonts
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  return { fontsLoaded, error };
};