export const colors = {
  // Backgrounds
  bg: '#08080f',
  bgAlt: '#0d0d18',
  bgSidebar: '#0c0c1a',
  bgNavBar: 'rgba(13,13,24,0.97)',

  // Text
  textPrimary: '#fff',
  textSecondary: 'rgba(255,255,255,0.6)',
  textTertiary: 'rgba(255,255,255,0.4)',
  textMuted: 'rgba(255,255,255,0.3)',
  textSubtle: 'rgba(255,255,255,0.28)',
  textPlaceholder: 'rgba(255,255,255,0.25)',
  textFaint: 'rgba(255,255,255,0.2)',

  // Surfaces
  surfaceDefault: 'rgba(255,255,255,0.06)',
  surfaceSubtle: 'rgba(255,255,255,0.05)',
  surfaceFaint: 'rgba(255,255,255,0.04)',
  surfaceBare: 'rgba(255,255,255,0.03)',

  // Borders
  borderDefault: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.07)',
  borderFaint: 'rgba(255,255,255,0.05)',

  // Semantic accent colors
  notificationDot: '#ff6b8a',
  income: '#30e8a0',
  spending: '#ff6b8a',
  savings: '#a78bfa',

  // Surface overlays
  bgToast: '#1e293b',

  // Semantic accent backgrounds
  incomeBg: 'rgba(48,232,160,0.12)',
  spendingBg: 'rgba(255,107,138,0.12)',
  savingsBg: 'rgba(167,139,250,0.12)',

  // Card overlay shadows
  shadowDark: 'rgba(0,0,0,0.55)',
  shadowLight: 'rgba(0,0,0,0.13)',
} as const;

export const fontFamily = {};

export const fontSize = {
  xxs: 9,
  xs: 10,
  sm: 11,
  md: 12,
  base: 13,
  lg: 14,
  xl: 16,
  '2xl': 18,
  '3xl': 24,
  '4xl': 28,
  '5xl': 34,
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const letterSpacing = {
  tighter: '-0.03em',
  tight: '-0.02em',
  normal: '0.08em',
  wide: '0.1em',
  wider: '0.14em',
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  '2xl': 20,
  '3xl': 22,
  card: 26,
  full: '50%' as const,
} as const;

export const layout = {
  sidebarWidth: 220,
  topbarHeight: 64,
  bottomNavHeight: 72,
} as const;

export const zIndex = {
  bottomNav: 100,
} as const;

export const transition = {
  fast: '0.15s',
  default: '0.2s',
  slow: '0.6s',
  slower: '0.8s',
} as const;

export const mediaQueries = {
  laptop: '(min-width: 1024px)',
  tablet: '(min-width: 764px)',
} as const;
