import React from "react";
import { View, Text } from "react-native";
import ToastManager from "toastify-react-native";
import { useTheme } from "@/theme";
import { ToastShowParams } from "toastify-react-native/utils/interfaces";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Star, StarOff, AlertCircle } from "lucide-react-native";
import { createStyles } from "./Toasts.styles";

const CustomToastComponents = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const styles = createStyles(colors, themeObj);

  const FavoriteAddedToast = ({ text1, text2 }: ToastShowParams) => (
    <View
      style={[
        styles.toastContainer,
        styles.favoriteAddedContainer,
        themeObj.components.cards[
          colorScheme === "dark" ? "darkMode" : "lightMode"
        ],
      ]}
    >
      <View style={[styles.iconContainer, styles.favoriteAddedIcon]}>
        <Star
          size={20}
          color={colors.semantic.fat}
          fill={colors.semantic.fat}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.primaryText, { color: colors.primaryText }]}>
          {text1}
        </Text>
        {text2 && (
          <Text style={[styles.secondaryText, { color: colors.secondaryText }]}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  );

  const FavoriteRemovedToast = ({ text1, text2 }: ToastShowParams) => (
    <View
      style={[
        styles.toastContainer,
        styles.favoriteRemovedContainer,
        themeObj.components.cards[
          colorScheme === "dark" ? "darkMode" : "lightMode"
        ],
      ]}
    >
      <View style={[styles.iconContainer, styles.favoriteRemovedIcon]}>
        <StarOff size={20} color={colors.secondaryText} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.primaryText, { color: colors.primaryText }]}>
          {text1}
        </Text>
        {text2 && (
          <Text style={[styles.secondaryText, { color: colors.secondaryText }]}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  );

  const ErrorToast = ({ text1, text2 }: ToastShowParams) => (
    <View
      style={[
        styles.toastContainer,
        styles.errorContainer,
        themeObj.components.cards[
          colorScheme === "dark" ? "darkMode" : "lightMode"
        ],
      ]}
    >
      <View style={[styles.iconContainer, styles.errorIcon]}>
        <AlertCircle size={20} color={colors.error} />
      </View>
      <View>
        <Text style={[styles.errorText, { color: colors.error }]}>{text1}</Text>
        {text2 && (
          <Text style={[styles.secondaryText, { color: colors.secondaryText }]}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  );

  return {
    favoriteAdded: FavoriteAddedToast,
    favoriteRemoved: FavoriteRemovedToast,
    error: ErrorToast,
  };
};

export const ThemedToastManager = () => {
  const insets = useSafeAreaInsets();
  const toastComponents = CustomToastComponents();
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);

  const toastConfig = {
    favoriteAdded: (props: ToastShowParams) => (
      <View style={[styles.toastWrapper, { marginTop: insets.top + 8 }]}>
        {toastComponents.favoriteAdded(props)}
      </View>
    ),
    favoriteRemoved: (props: ToastShowParams) => (
      <View style={[styles.toastWrapper, { marginTop: insets.top + 8 }]}>
        {toastComponents.favoriteRemoved(props)}
      </View>
    ),
    error: (props: ToastShowParams) => (
      <View style={[styles.toastWrapper, { marginTop: insets.top + 8 }]}>
        {toastComponents.error(props)}
      </View>
    ),
  };

  return <ToastManager config={toastConfig} useModal={false} />;
};
