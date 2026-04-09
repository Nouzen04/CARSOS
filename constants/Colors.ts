const tintColorLight = '#6366f1'; // Indigo
const tintColorDark = '#8b5cf6'; // Violet

export default {
  light: {
    text: '#0f172a', // Slate 900
    background: '#f8fafc', // Slate 50
    tint: tintColorLight,
    tabIconDefault: '#94a3b8', // Slate 400
    tabIconSelected: tintColorLight,
    primary: '#6366f1',
    secondary: '#3b82f6', // Blue 500
    accent: '#f59e0b', // Amber
    surface: '#ffffff',
    error: '#ef4444',
  },
  dark: {
    text: '#f8fafc',
    background: '#0f172a',
    tint: tintColorDark,
    tabIconDefault: '#475569',
    tabIconSelected: tintColorDark,
    primary: '#8b5cf6',
    secondary: '#6366f1',
    accent: '#fbbf24',
    surface: '#1e293b',
    error: '#f87171',
  },
};
