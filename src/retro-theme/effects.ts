import { ViewStyle, ImageStyle } from 'react-native';

export const effects = {
  // No border radius - all sharp edges
  borderRadius: 0,
  
  // No shadows - pixel design uses layered borders for depth
  shadow: 'none',
  
  // Border widths
  borders: {
    thin: 1,
    medium: 2,
    thick: 3,
  },

  // Container styles with pixel texture effects
  containers: {
    default: {
      backgroundColor: '#2B2B2B',
      borderWidth: 1,
      borderColor: '#999999',
      borderRadius: 0,
    } as ViewStyle,
    
    nested: {
      backgroundColor: '#181818',
      borderWidth: 1,
      borderColor: '#444444',
      borderRadius: 0,
    } as ViewStyle,
    
    // Elevated container using layered borders instead of shadows
    elevated: {
      backgroundColor: '#2B2B2B',
      borderWidth: 1,
      borderColor: '#999999',
      borderRadius: 0,
      // Simulated depth with additional border
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderTopColor: '#E0E0E0',
      borderLeftColor: '#E0E0E0',
    } as ViewStyle,
  },

  // Button effects
  buttons: {
    primary: {
      default: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#999999',
        borderRadius: 0,
      } as ViewStyle,
      
      pressed: {
        backgroundColor: '#181818',
        borderWidth: 1,
        borderColor: '#999999',
        borderRadius: 0,
        // Inset effect for pressed state
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderTopColor: '#444444',
        borderLeftColor: '#444444',
      } as ViewStyle,
    },
    
    secondary: {
      default: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#444444',
        borderRadius: 0,
      } as ViewStyle,
      
      pressed: {
        backgroundColor: '#181818',
        borderWidth: 1,
        borderColor: '#444444',
        borderRadius: 0,
      } as ViewStyle,
    },
    
    fab: {
      default: {
        backgroundColor: '#2B2B2B',
        borderWidth: 1,
        borderColor: '#999999',
        borderRadius: 0,
        // Elevated effect with layered borders
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderTopColor: '#E0E0E0',
        borderLeftColor: '#E0E0E0',
      } as ViewStyle,
      
      pressed: {
        backgroundColor: '#181818',
        borderWidth: 1,
        borderColor: '#999999',
        borderRadius: 0,
      } as ViewStyle,
    },
  },

  // Input field effects
  inputs: {
    default: {
      backgroundColor: '#181818',
      borderWidth: 1,
      borderColor: '#999999',
      borderRadius: 0,
    } as ViewStyle,
    
    focused: {
      backgroundColor: '#181818',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 0,
    } as ViewStyle,
  },

  // Progress bar effects
  progressBar: {
    track: {
      backgroundColor: '#2B2B2B',
      borderWidth: 1,
      borderColor: '#999999',
      borderRadius: 0,
      height: 8,
    } as ViewStyle,
    
    fill: {
      backgroundColor: '#444444',
      borderRadius: 0,
      height: 6, // Slightly smaller than track for pixel effect
    } as ViewStyle,
  },

  // Texture patterns (for future implementation with background images)
  textures: {
    // Repeating diagonal pattern for containers
    container: {
      // This would be implemented with a background image or custom drawing
      pattern: 'diagonal-lines',
      opacity: 0.3,
      size: 4,
    },
    
    // Pixel grid pattern for sliders/progress bars
    pixelGrid: {
      pattern: 'pixel-grid',
      color: '#E0E0E0',
      size: 2,
    },
  },

  // Animation configs - instant state changes for pixel design
  animations: {
    // No smooth transitions - instant state changes
    instant: {
      duration: 0,
    },
    
    // Very fast for any necessary animations
    fast: {
      duration: 100,
    },
  },

  // Depth layers using borders instead of shadows
  depth: {
    level1: {
      borderWidth: 1,
      borderColor: '#999999',
    } as ViewStyle,
    
    level2: {
      borderWidth: 1,
      borderColor: '#999999',
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderTopColor: '#E0E0E0',
      borderLeftColor: '#E0E0E0',
    } as ViewStyle,
    
    level3: {
      borderWidth: 2,
      borderColor: '#999999',
      borderTopWidth: 3,
      borderLeftWidth: 3,
      borderTopColor: '#E0E0E0',
      borderLeftColor: '#E0E0E0',
    } as ViewStyle,
  },
} as const;

export type Effects = typeof effects;