export const animations = {
  // Standard animation durations in milliseconds
  durations: {
    immediate: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  // Cubic bezier easing curves
  easings: {
    linear: [0.0, 0.0, 1.0, 1.0],
    easeIn: [0.42, 0.0, 1.0, 1.0],
    easeOut: [0.0, 0.0, 0.58, 1.0],
    easeInOut: [0.42, 0.0, 0.58, 1.0],
    appleEase: [0.25, 0.1, 0.25, 1.0],
  },

  // Spring configurations for react-native-reanimated
  springs: {
    gentle: {
      damping: 25,
      stiffness: 120,
      mass: 1,
    },
    
    bouncy: {
      damping: 18,
      stiffness: 150,
      mass: 1,
    },
    
    snappy: {
      damping: 30,
      stiffness: 400,
      mass: 1,
    },
    
    layout: {
      damping: 20,
      stiffness: 180,
      mass: 1,
    }
  },

  // Animation presets for common interactions
  presets: {
    fadeIn: {
      type: 'timing',
      duration: 250,
      easing: 'easeOut',
      properties: ['opacity']
    },
    
    slideIn: {
      type: 'spring',
      config: 'bouncy', 
      properties: ['translateX', 'translateY']
    },
    
    scale: {
      type: 'spring',
      config: 'snappy',
      properties: ['scaleX', 'scaleY']
    },
    
    buttonPress: {
      type: 'spring',
      config: 'gentle',
      scaleDown: 0.95,
      duration: 150
    },
    
    swipeDelete: {
      slideOut: {
        type: 'timing',
        duration: 250,
        easing: 'easeIn'
      },
      collapse: {
        type: 'timing', 
        duration: 200,
        easing: 'easeOut'
      }
    }
  }
} as const;

export type Animations = typeof animations;