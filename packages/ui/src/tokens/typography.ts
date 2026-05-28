export const fontFamilies = {
  display: 'Fraunces',
  body: 'Manrope',
  arabic: 'Tajawal',
  mono: 'JetBrains Mono',
} as const;

export const fontSizes = {
  '2xs': 11,
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeights = {
  tight: 1.15,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.7,
} as const;
