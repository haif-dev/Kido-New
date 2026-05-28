/**
 * Design tokens — Colors.
 * Single source of truth shared by web (Tailwind preset) and mobile (StyleSheet).
 * Direction: warm modernist — terracotta + cream + forest, not generic teal.
 */
export const colors = {
  canvas: '#FBF7F2',
  surface: '#FFFFFF',
  elevated: '#FFFDFA',

  primary: {
    50: '#FBEEE8',
    100: '#F6D9CC',
    200: '#EDB39B',
    300: '#E48D6A',
    400: '#D67452',
    500: '#C45A3F',
    600: '#A24830',
    700: '#7F3724',
    800: '#5C2719',
    900: '#3A180F',
    contrast: '#FBF7F2',
  },
  secondary: {
    50: '#E7EFEB',
    100: '#CFE0D7',
    500: '#2D5544',
    700: '#1B3A2E',
  },
  accent: {
    DEFAULT: '#E8A82C',
    contrast: '#2A1F1A',
  },

  ink: {
    DEFAULT: '#2A1F1A',
    muted: '#7A6F66',
    subtle: '#A89C90',
    inverse: '#FBF7F2',
  },

  line: '#E8DFD3',
  lineStrong: '#D4C5B0',

  success: { DEFAULT: '#3F7A57', contrast: '#FBF7F2' },
  danger:  { DEFAULT: '#B33A2E', contrast: '#FBF7F2' },
  warning: { DEFAULT: '#D68A1E', contrast: '#2A1F1A' },
  info:    { DEFAULT: '#3B6E8F', contrast: '#FBF7F2' },
} as const;

export type Colors = typeof colors;
