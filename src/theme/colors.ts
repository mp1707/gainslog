export const colors = {
  // Background colors
  background: {
    primary: '#f8f9fa',
    secondary: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    white: '#ffffff',
  },

  // Border colors
  border: {
    light: '#f3f4f6',
    medium: '#e5e7eb',
    dark: '#d1d5db',
  },

  // Brand colors
  brand: {
    primary: '#007AFF',
    secondary: '#34D399',
    danger: '#FF3B30',
  },

  // Status colors
  status: {
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
  },

  // Confidence indicator colors
  confidence: {
    low: {
      background: '#fee2e2',
      text: '#dc2626',
    },
    medium: {
      background: '#fef3c7',
      text: '#d97706',
    },
    high: {
      background: '#dcfce7',
      text: '#16a34a',
    },
    loading: {
      background: '#f3f4f6',
      text: '#6b7280',
    },
  },

  // Skeleton loading colors
  skeleton: '#e5e7eb',

  // Macro display colors
  macro: '#059669',
} as const;

export type Colors = typeof colors;