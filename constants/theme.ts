// constants/theme.ts

import { Platform } from 'react-native';

// ─── Brand Colors ──────────────────────────────────────────────

export const BLUE    = '#1986df';   // primary brand — replaces 21 local constants
export const GREEN   = '#27ae60';   // compliant / success / finish button
export const RED     = '#e74c3c';   // non-compliant / danger / cancel button
export const ORANGE  = '#f39c12';   // partial / warning / signature button
export const YELLOW  = '#f1c40f';   // accent / highlight

// ─── Neutral Palette ───────────────────────────────────────────

export const DARK    = '#2c3e50';   // primary text, section titles
export const MUTED   = '#7f8c8d';   // secondary text, dates, labels
export const FAINT   = '#95a5a6';   // tertiary text, addresses
export const LIGHT   = '#ecf0f1';   // backgrounds, section headers, progress tracks
export const BORDER  = '#bdc3c7';   // card borders, dividers
export const WHITE   = '#ffffff';
export const SURFACE = '#f9f9f9';   // card backgrounds

// ─── Semantic Aliases (use these in components, not raw colors) ────────────
export const Colors = {
  // Actions
  primary:   BLUE,
  success:   GREEN,
  danger:    RED,
  warning:   ORANGE,

  // Text
  textPrimary:   DARK,
  textSecondary: MUTED,
  textTertiary:  FAINT,
  textInverse:   WHITE,

  // Surfaces
  background:    '#f8fcff',
  surface:       SURFACE,
  surfaceOffset: LIGHT,
  border:        BORDER,

  // Status (used in InspectionItem, statusUtils)
  compliant:    GREEN,
  nonCompliant: RED,
  partial:      ORANGE,
  notEvaluated: MUTED,

  // Compliance grades
  gradeA: GREEN,
  gradeB: '#2ecc71',
  gradeC: ORANGE,
  gradeD: RED,
  gradeF: '#c0392b',

  // ─── Legacy aliases ───────────────────────────────────────────────
  // These short names were used in the old src/constants/colors.ts.
  // They map 1-to-1 to the semantic tokens above so no value changes.
  blue:   BLUE,        // = primary
  dark:   DARK,        // = textPrimary
  mid:    MUTED,       // = textSecondary
  light:  LIGHT,       // = surfaceOffset
  red:    RED,         // = danger
  green:  GREEN,       // = success
  white:  WHITE,       // = textInverse
} as const;

// ─── Spacing (4px base unit) ───────────────────────────────────────────
export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  base: 16,
  lg:  20,
  xl:  24,
  xxl: 32,
} as const;

// ─── Typography ──────────────────────────────────────────────
export const FontSize = {
  xs:   11,
  sm:   12,
  base: 14,
  md:   15,
  lg:   16,
  xl:   18,
  xxl:  20,
  hero: 24,
} as const;

export const FontWeight = {
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
};

export const Fonts = Platform.select({
  ios:     { sans: 'system-ui', mono: 'ui-monospace' },
  default: { sans: 'normal',    mono: 'monospace' },
  web:     { sans: "system-ui, -apple-system, sans-serif", mono: "Menlo, monospace" },
});

// ─── Border Radius ──────────────────────────────────────────────
export const Radius = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   20,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
} as const;
