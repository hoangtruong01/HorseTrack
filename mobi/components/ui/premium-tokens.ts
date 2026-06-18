export const premiumColors = {
  bg: '#0B0D12',
  surface: '#11141B',
  surface2: '#171B24',
  surface3: '#202633',
  border: 'rgba(255,255,255,0.08)',
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
  bgElevated: '#141822',
  surfaceGlass: 'rgba(255,255,255,0.055)',
  surfaceGlassStrong: 'rgba(255,255,255,0.085)',
  surfaceGlassSubtle: 'rgba(255,255,255,0.035)',
  borderGlass: 'rgba(255,255,255,0.14)',
  borderSoft: 'rgba(255,255,255,0.07)',
  redGlow: 'rgba(225,6,0,0.22)',
  redGlowStrong: 'rgba(225,6,0,0.32)',
};

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

export function getPremiumToneColor(tone?: PremiumTone): string {
  switch (tone) {
    case 'brand': return premiumColors.brand;
    case 'success': return premiumColors.success;
    case 'warning': return premiumColors.warning;
    case 'danger': return premiumColors.danger;
    case 'info': return premiumColors.info;
    case 'gold': return premiumColors.gold;
    case 'neutral': default: return premiumColors.textSecondary;
  }
}
