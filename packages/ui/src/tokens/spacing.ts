export const spacing = {
  0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32,
  10: 40, 12: 48, 14: 56, 16: 64, 20: 80, 24: 96,
} as const;

export const radii = {
  sm: 6, DEFAULT: 10, md: 14, lg: 20, xl: 28, '2xl': 36, pill: 999,
} as const;

export const shadows = {
  soft: { shadowColor: '#2A1F1A', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 2 },
  lift: { shadowColor: '#2A1F1A', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, elevation: 6 },
} as const;
