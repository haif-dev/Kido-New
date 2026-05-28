/**
 * Shared Tailwind preset for the design system.
 * Aesthetic direction: "Sun-warm modernist" — warm cream base,
 * deep terracotta primary, forest green secondary, marigold accent.
 * Distinctive, trustworthy, not a generic teal-marketplace look.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Surfaces
        canvas: '#FBF7F2',      // warm cream background
        surface: '#FFFFFF',
        elevated: '#FFFDFA',

        // Brand
        primary: {
          DEFAULT: '#C45A3F',   // deep terracotta
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
          DEFAULT: '#2D5544',
          50: '#E7EFEB',
          100: '#CFE0D7',
          500: '#2D5544',
          700: '#1B3A2E',
        },
        accent: {
          DEFAULT: '#E8A82C',   // marigold
          contrast: '#2A1F1A',
        },

        // Text
        ink: {
          DEFAULT: '#2A1F1A',   // deep brown for body text
          muted: '#7A6F66',
          subtle: '#A89C90',
          inverse: '#FBF7F2',
        },

        // Lines
        line: '#E8DFD3',
        'line-strong': '#D4C5B0',

        // States
        success: { DEFAULT: '#3F7A57', contrast: '#FBF7F2' },
        danger:  { DEFAULT: '#B33A2E', contrast: '#FBF7F2' },
        warning: { DEFAULT: '#D68A1E', contrast: '#2A1F1A' },
        info:    { DEFAULT: '#3B6E8F', contrast: '#FBF7F2' },
      },
      fontFamily: {
        // Distinctive choices, not generic Inter
        display: ['Fraunces', 'Georgia', 'serif'],      // editorial serif for headlines
        body:    ['Manrope', 'system-ui', 'sans-serif'],// clean grotesk for UI
        arabic:  ['Tajawal', 'system-ui', 'sans-serif'],// good Arabic pairing
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
        '2xl': '36px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(42,31,26,0.04), 0 4px 12px rgba(42,31,26,0.06)',
        lift: '0 2px 6px rgba(42,31,26,0.06), 0 12px 32px rgba(42,31,26,0.10)',
        focus: '0 0 0 3px rgba(196,90,63,0.25)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      transitionTimingFunction: {
        // Custom easing — soft, confident
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
