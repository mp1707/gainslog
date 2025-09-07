import { ExpoConfig, ConfigContext } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_DEV
    ? "MacroLoop (Dev)"
    : IS_PREVIEW
    ? "MacroLoop (Preview)"
    : "MacroLoop",
  slug: "macroloop",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  scheme: "macroloop",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    infoPlist: {
      // Permission descriptions are handled by the plugins below.
      ITSAppUsesNonExemptEncryption: false,
    },
    bundleIdentifier: IS_DEV
      ? "com.mp17.mpapps.macroloop.dev"
      : IS_PREVIEW
      ? "com.mp17.mpapps.macroloop.preview"
      : "com.mp17.mpapps.macroloop",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    permissions: [
      "android.permission.CAMERA",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.READ_MEDIA_VIDEO",
      "android.permission.RECORD_AUDIO",
      "android.permission.MODIFY_AUDIO_SETTINGS",
    ],
    package: IS_DEV
      ? "com.mp17.macroloop.dev"
      : IS_PREVIEW
      ? "com.mp17.macroloop.preview"
      : "com.mp17.macroloop",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    [
      "expo-image-picker",
      {
        photosPermission:
          "This app needs access to your photo library to select food images for logging.",
        cameraPermission:
          "This app needs access to your camera to take photos of food for logging.",
      },
    ],
    [
      "expo-speech-recognition",
      {
        microphonePermission:
          "Allow MacroLoop to use the microphone for audio food logging.",
        speechRecognitionPermission:
          "Allow MacroLoop to use speech recognition for audio food logging.",
      },
    ],
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/Nunito-Regular.ttf",
          "./assets/fonts/Nunito-SemiBold.ttf",
          "./assets/fonts/Nunito-Bold.ttf",
        ],
      },
    ],
  ],
  extra: {
    eas: {
      projectId: "9399162f-831f-4f85-8a40-602317f608cb",
    },
  },
  updates: {
    url: "https://u.expo.dev/9399162f-831f-4f85-8a40-602317f608cb",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  owner: "mp17",
});
