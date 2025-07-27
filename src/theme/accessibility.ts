export const accessibility = {
  // Contrast requirements for WCAG 2.2 AA compliance
  contrast: {
    minimumRatio: 4.5,
    largeTextRatio: 3.0,
  },
  
  // Touch target specifications
  touchTargets: {
    minimum: 44,
    recommended: 48,
  },
  
  // Focus indicator specifications
  focus: {
    indicatorColor: '#007AFF', // brand.primary
    indicatorWidth: 2,
    borderRadius: 4,
  },
  
  // Animation preferences
  animation: {
    respectReducedMotion: true,
    alternativeDuration: 0,
  }
} as const;

export type Accessibility = typeof accessibility;