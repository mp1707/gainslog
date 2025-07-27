import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, StatusBar } from 'react-native';
import { theme, ColorScheme } from '../theme';

type Colors = typeof theme.colors.light | typeof theme.colors.dark;

interface ThemeContextType {
  colorScheme: ColorScheme;
  colors: Colors;
  theme: typeof theme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    Appearance.getColorScheme() || 'light'
  );

  // Listen for system appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      setColorScheme(newColorScheme || 'light');
    });

    return () => subscription?.remove();
  }, []);

  // Update status bar style based on color scheme
  useEffect(() => {
    StatusBar.setBarStyle(
      colorScheme === 'dark' ? 'light-content' : 'dark-content',
      true
    );
  }, [colorScheme]);

  const colors = theme.getColors(colorScheme);

  const toggleColorScheme = () => {
    setColorScheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    colorScheme,
    colors,
    theme,
    setColorScheme,
    toggleColorScheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper hook for getting themed styles
export const useThemedStyles = <T extends Record<string, unknown>>(
  styleFactory: (colors: Colors, themeObj: typeof theme) => T
): T => {
  const { colors, theme: themeObj } = useTheme();
  return styleFactory(colors, themeObj);
};