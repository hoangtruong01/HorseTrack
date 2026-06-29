import { useColorScheme } from 'react-native';

export const premiumColors = {
  bg: '#000000',
  surface: 'rgba(12, 12, 14, 0.92)',
  surface2: 'rgba(18, 18, 22, 0.86)',
  surface3: 'rgba(26, 26, 30, 0.78)',
  border: 'rgba(255,255,255,0.09)',
  borderStrong: 'rgba(255,255,255,0.14)',
  text: '#F5F7FA',
  textSecondary: '#AEB6C2',
  textMuted: '#6F7785',
  brand: '#E10600',
  brandSoft: 'rgba(225,6,0,0.14)',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#38BDF8',
  gold: '#D6A84F',
  bgElevated: '#050505',
  surfaceGlass: 'rgba(255,255,255,0.045)',
  surfaceGlassStrong: 'rgba(255,255,255,0.075)',
  surfaceGlassSubtle: 'rgba(255,255,255,0.028)',
  borderGlass: 'rgba(255,255,255,0.13)',
  borderSoft: 'rgba(255,255,255,0.065)',
  redGlow: 'rgba(225,6,0,0.22)',
  redGlowStrong: 'rgba(225,6,0,0.32)',
  headerBg: '#000000',
  headerBorder: 'rgba(255,255,255,0.07)',
};

export function usePremiumColors() {
  const isDark = useColorScheme() === 'dark';
  return {
    ...premiumColors,
    bg: isDark ? premiumColors.bg : '#F7F4F1',
    surface: isDark ? premiumColors.surface : '#FFFFFF',
    surface2: isDark ? premiumColors.surface2 : '#FFFFFF',
    surface3: isDark ? premiumColors.surface3 : '#F2F2F7',
    border: isDark ? premiumColors.border : '#EAEAEA',
    borderStrong: isDark ? premiumColors.borderStrong : '#D1D5DB',
    text: isDark ? premiumColors.text : '#1C1C25',
    textSecondary: isDark ? premiumColors.textSecondary : '#58585B',
    textMuted: isDark ? premiumColors.textMuted : '#8A8A8E',
    surfaceGlass: isDark ? premiumColors.surfaceGlass : '#FFFFFF',
    surfaceGlassStrong: isDark ? premiumColors.surfaceGlassStrong : '#F9FAFB',
    surfaceGlassSubtle: isDark ? premiumColors.surfaceGlassSubtle : '#FFFFFF',
    borderGlass: isDark ? premiumColors.borderGlass : '#EAEAEA',
    borderSoft: isDark ? premiumColors.borderSoft : '#EAEAEA',
    headerBg: isDark ? premiumColors.headerBg : '#FFFFFF',
    headerBorder: isDark ? premiumColors.headerBorder : '#D3DADE',
  };
}

export const premiumSpacing = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
  56: 56,
  64: 64,
  80: 80,
  96: 96,
  120: 120,
};

export const premiumRadius = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  28: 28,
  full: 9999,
};

export const premiumTypography = {
  sizes: {
    11: 11,
    12: 12,
    13: 13,
    14: 14,
    16: 16,
    18: 18,
    20: 20,
    24: 24,
    32: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
};

export const premiumShadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  redGlow: {
    shadowColor: '#E10600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
};

export type PremiumTone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'neutral';

export function getPremiumToneColor(tone?: PremiumTone, colors: any = premiumColors): string {
  switch (tone) {
    case 'brand': return colors.brand;
    case 'success': return colors.success;
    case 'warning': return colors.warning;
    case 'danger': return colors.danger;
    case 'info': return colors.info;
    case 'gold': return colors.gold;
    case 'neutral': default: return colors.textSecondary;
  }
}
