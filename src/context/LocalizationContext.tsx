import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";

import i18next, {
  SUPPORTED_LANGUAGE_CODES,
  SupportedLanguageCode,
} from "@/lib/i18n";

const LANGUAGE_PREFERENCE_STORAGE_KEY = "languagePreference";

export type LanguagePreference = "device" | SupportedLanguageCode;

type LocalizationContextValue = {
  languagePreference: LanguagePreference;
  currentLanguage: string;
  deviceLanguage: SupportedLanguageCode;
  isLocalizationReady: boolean;
  setLanguagePreference: (preference: LanguagePreference) => Promise<void>;
};

const LocalizationContext =
  createContext<LocalizationContextValue | undefined>(undefined);

const normalizeLanguageCode = (code?: string | null): SupportedLanguageCode => {
  const normalized = code?.toLowerCase();
  return SUPPORTED_LANGUAGE_CODES.includes(normalized as SupportedLanguageCode)
    ? (normalized as SupportedLanguageCode)
    : "en";
};

const getDeviceLanguage = (): SupportedLanguageCode => {
  const primaryLocale = getLocales()[0];
  return normalizeLanguageCode(primaryLocale?.languageCode);
};

const isLanguagePreference = (value: unknown): value is LanguagePreference =>
  value === "device" ||
  SUPPORTED_LANGUAGE_CODES.includes(value as SupportedLanguageCode);

const resolveLanguage = (
  preference: LanguagePreference,
  deviceLanguage: SupportedLanguageCode
): SupportedLanguageCode => {
  return preference === "device" ? deviceLanguage : preference;
};

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({
  children,
}) => {
  const [languagePreference, setLanguagePreferenceState] =
    useState<LanguagePreference>("device");
  const [deviceLanguage] = useState<SupportedLanguageCode>(getDeviceLanguage);
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    i18next.language || deviceLanguage
  );
  const [isLocalizationReady, setIsLocalizationReady] = useState(false);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng);
    };
    i18next.on("languageChanged", handleLanguageChanged);

    return () => {
      i18next.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapLanguage = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem(
          LANGUAGE_PREFERENCE_STORAGE_KEY
        );

        const preference: LanguagePreference = isLanguagePreference(
          storedPreference
        )
          ? storedPreference
          : "device";

        const nextLanguage = resolveLanguage(preference, deviceLanguage);
        await i18next.changeLanguage(nextLanguage);

        if (isMounted) {
          setLanguagePreferenceState(preference);
          setCurrentLanguage(i18next.language);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("Failed to bootstrap language preference", error);
        }
      } finally {
        if (isMounted) {
          setIsLocalizationReady(true);
        }
      }
    };

    bootstrapLanguage();

    return () => {
      isMounted = false;
    };
  }, [deviceLanguage]);

  const persistPreference = useCallback(async (preference: LanguagePreference) => {
    try {
      await AsyncStorage.setItem(
        LANGUAGE_PREFERENCE_STORAGE_KEY,
        preference
      );
    } catch (error) {
      if (__DEV__) {
        console.warn("Failed to persist language preference", error);
      }
    }
  }, []);

  const handleSetLanguagePreference = useCallback(
    async (preference: LanguagePreference) => {
      if (preference === languagePreference && isLocalizationReady) {
        return;
      }

      setLanguagePreferenceState(preference);
      await persistPreference(preference);

      const nextLanguage = resolveLanguage(preference, deviceLanguage);
      await i18next.changeLanguage(nextLanguage);
    },
    [deviceLanguage, languagePreference, isLocalizationReady, persistPreference]
  );

  const value = useMemo(
    () => ({
      languagePreference,
      currentLanguage,
      deviceLanguage,
      isLocalizationReady,
      setLanguagePreference: handleSetLanguagePreference,
    }),
    [
      currentLanguage,
      deviceLanguage,
      handleSetLanguagePreference,
      isLocalizationReady,
      languagePreference,
    ]
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextValue => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error(
      "useLocalization must be used within a LocalizationProvider"
    );
  }

  return context;
};
