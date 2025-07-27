export const icons = {
  // Standard icon sizes
  sizes: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },

  // Semantic icon mappings for FontAwesome
  semantic: {
    actions: {
      camera: 'camera',
      microphone: 'microphone', 
      edit: 'pencil',
      delete: 'trash',
      save: 'check',
      cancel: 'times',
      add: 'plus',
      remove: 'minus',
      settings: 'cog',
      info: 'info-circle'
    },
    
    navigation: {
      back: 'chevron-left',
      forward: 'chevron-right',
      up: 'chevron-up',
      down: 'chevron-down',
      menu: 'bars',
      close: 'times'
    },
    
    content: {
      food: 'cutlery',
      nutrition: 'pie-chart',
      calendar: 'calendar',
      user: 'user',
      search: 'search',
      filter: 'filter'
    },
    
    feedback: {
      success: 'check-circle',
      warning: 'exclamation-triangle',
      error: 'exclamation-circle', 
      info: 'info-circle',
      loading: 'spinner'
    }
  },

  // Usage guidelines
  usage: {
    buttonIcons: {
      size: 'md',
      color: 'inherit',
    },
    
    navigationIcons: {
      size: 'lg', 
      color: 'text.primary',
    },
    
    statusIcons: {
      size: 'sm',
      color: 'semantic',
    }
  }
} as const;

export type Icons = typeof icons;