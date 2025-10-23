export const theme = {
  colors: {
    // Dark theme with high contrast for construction workers
    background: '#0a0a0a',
    surface: '#1a1a1a',
    surfaceElevated: '#2a2a2a',
    primary: '#00d4ff',
    primaryDark: '#0099cc',
    secondary: '#ff6b35',
    accent: '#ffd700',
    text: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: '#999999',
    border: '#333333',
    borderLight: '#444444',
    success: '#00ff88',
    warning: '#ffaa00',
    error: '#ff4444',
    info: '#00aaff',
    
    // Construction-specific colors
    safety: '#00ff88',
    danger: '#ff4444',
    caution: '#ffaa00',
    
    // Message colors
    messageOwn: '#00d4ff',
    messageOther: '#2a2a2a',
    messageSystem: '#ff6b35',
    
    // Channel colors
    channelGeneral: '#00d4ff',
    channelUpdates: '#00ff88',
    channelIssues: '#ff4444',
    channelSafety: '#ffaa00',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 15,
    },
  },
};

