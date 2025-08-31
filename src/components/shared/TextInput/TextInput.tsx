import React, { useState, forwardRef } from "react";
import { TextInput as RNTextInput, TextInputProps, Pressable, View } from "react-native";
import { useTheme } from "@/theme";
import { createStyles } from "./TextInput.styles";

interface CustomTextInputProps extends TextInputProps {
  containerStyle?: any;
  fontSize?: "Title1" | "Title2" | "Headline" | "Body" | "Subhead" | "Caption";
}

export const TextInput = forwardRef<RNTextInput, CustomTextInputProps>(
  ({ containerStyle, style, fontSize = "Body", onFocus, onBlur, ...props }, ref) => {
    const { colors, theme, colorScheme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const styles = createStyles(colors, theme, isFocused, fontSize);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <View style={[styles.outerContainer, containerStyle]}>
        <Pressable
          style={styles.focusBorder}
          onPress={() => (ref as any)?.current?.focus()}
        >
          <RNTextInput
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            keyboardAppearance={colorScheme}
            style={[styles.textInput, style]}
            placeholderTextColor={colors.secondaryText}
            {...props}
          />
        </Pressable>
      </View>
    );
  }
);

TextInput.displayName = "TextInput";