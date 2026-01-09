/**
 * Spacing and sizing design tokens.
 * Based on an 8pt grid system (iOS/Material Design standard).
 * All values derived from BASE_UNIT for consistency.
 */

const BASE_UNIT = 8;

export const spacing = {
  /** 4px - micro spacing */
  xs: BASE_UNIT * 0.5,
  /** 8px - small spacing */
  sm: BASE_UNIT,
  /** 12px - small-medium spacing */
  md: BASE_UNIT * 1.5,
  /** 16px - medium spacing (default padding) */
  lg: BASE_UNIT * 2,
  /** 24px - large spacing */
  xl: BASE_UNIT * 3,
  /** 32px - extra large spacing */
  xxl: BASE_UNIT * 4,
  /** 48px - huge spacing */
  xxxl: BASE_UNIT * 6,
} as const;

export const sizing = {
  /** Touch target minimum (44pt - Apple HIG) */
  touchTarget: 44,
  /** Standard icon size */
  icon: 22,
  /** Large icon size */
  iconLg: 32,
  /** Avatar sizes */
  avatarSm: 28,
  avatarMd: 44,
  avatarLg: 56,
  /** Border radius */
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusFull: 9999,
} as const;

export const layout = {
  /** Standard screen horizontal padding */
  screenPadding: spacing.lg,
} as const;

export const fontSize = {
  /** 13px - caption, footnotes */
  xs: 13,
  /** 14px - secondary text, labels */
  sm: 14,
  /** 16px - base body text */
  md: 16,
  /** 17px - primary body text, inputs (iOS standard) */
  lg: 17,
  /** 20px - subheadings */
  xl: 20,
  /** 24px - headings */
  xxl: 24,
} as const;

export type TSpacing = typeof spacing;
export type TSizing = typeof sizing;
export type TLayout = typeof layout;
export type TFontSize = typeof fontSize;

