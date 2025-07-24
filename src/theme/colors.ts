export const colors = {
  // Semantic background colors
  background: {
    primary: "#f8f9fa",
    secondary: "#ffffff", 
    tertiary: "#f3f4f6",
    overlay: "rgba(0, 0, 0, 0.7)",
    glass: "rgba(255, 255, 255, 0.85)",
  },
  
  // Surface colors for cards, modals, and elevated content
  surface: {
    primary: "#ffffff",
    secondary: "#f8f9fa",
    elevated: "#ffffff",
    depressed: "#f3f4f6",
  },

  // Text colors with proper contrast ratios
  text: {
    primary: "#111827",
    secondary: "#6b7280", 
    tertiary: "#9ca3af",
    quaternary: "#d1d5db",
    inverse: "#ffffff",
    onColor: "#ffffff",
  },

  // Border colors for different interaction states
  border: {
    primary: "#e5e7eb",
    secondary: "#f3f4f6", 
    focus: "#007AFF",
    error: "#dc2626",
    divider: "#f3f4f6",
  },

  // Brand colors with tonal variations
  brand: {
    primary: {
      50: "#eff6ff",
      100: "#dbeafe", 
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#007AFF", // Default primary
      600: "#0056cc",
      700: "#0041a3",
      800: "#003785",
      900: "#002c6b",
    },
    
    secondary: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0", 
      300: "#6ee7b7",
      400: "#34d399", // Default secondary
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
    },
    
    accent: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5", 
      400: "#f87171",
      500: "#FF3B30", // Default accent
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    }
  },

  // Functional state colors
  functional: {
    success: {
      background: "#dcfce7",
      foreground: "#16a34a",
      border: "#bbf7d0",
    },
    
    warning: {
      background: "#fef3c7", 
      foreground: "#d97706",
      border: "#fed7aa",
    },
    
    error: {
      background: "#fee2e2",
      foreground: "#dc2626", 
      border: "#fecaca",
    },
    
    info: {
      background: "#dbeafe",
      foreground: "#2563eb",
      border: "#bfdbfe", 
    }
  },

  // Nutrition-specific colors
  nutrition: {
    protein: {
      primary: "#34d399",
      background: "#dcfce7",
      light: "#a7f3d0",
    },
    
    carbohydrates: {
      primary: "#60a5fa", 
      background: "#dbeafe",
      light: "#bfdbfe",
    },
    
    fat: {
      primary: "#f59e0b",
      background: "#fef3c7",
      light: "#fed7aa", 
    },
    
    calories: {
      primary: "#c084fc",
      background: "#f3e8ff", 
      light: "#ddd6fe",
    }
  },

  // Confidence indicator colors with ranges
  confidence: {
    high: {
      background: "#dcfce7",
      foreground: "#16a34a",
      indicator: "#22c55e",
    },
    
    good: {
      background: "#fef3c7",
      foreground: "#d97706", 
      indicator: "#f59e0b",
    },
    
    partial: {
      background: "#fed7aa",
      foreground: "#ea580c",
      indicator: "#f97316", 
    },
    
    uncertain: {
      background: "#fee2e2",
      foreground: "#dc2626",
      indicator: "#ef4444",
    },
    
    loading: {
      background: "#f3f4f6",
      foreground: "#6b7280",
      indicator: "#9ca3af",
    }
  },

  // Interactive element states
  interactive: {
    primary: {
      default: "#007AFF",
      hover: "#0056cc", 
      pressed: "#0041a3",
      disabled: "#9ca3af",
    },
    
    secondary: {
      default: "#34d399",
      hover: "#10b981",
      pressed: "#059669", 
      disabled: "#9ca3af",
    },
    
    destructive: {
      default: "#FF3B30",
      hover: "#dc2626",
      pressed: "#b91c1c",
      disabled: "#9ca3af",
    }
  },

  // Loading skeleton colors
  skeleton: {
    base: "#e5e7eb",
    highlight: "#f3f4f6",
    animated: "#f9fafb",
  },
} as const;

export type Colors = typeof colors;
