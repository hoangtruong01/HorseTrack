import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, ViewStyle, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePremiumColors, premiumSpacing, premiumRadius, premiumTypography, premiumShadows, PremiumTone, getPremiumToneColor } from './premium-tokens';

// ─── AppScreen ──────────────────────────────────────────────────────────────
interface AppScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function AppScreen({ children, scroll, padded, refreshing, onRefresh, style, contentStyle }: AppScreenProps) {
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(premiumColors), [premiumColors]);

  const innerContent = (
    <View style={[padded && styles.paddedContainer, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.screen, style]} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing ?? false}
                onRefresh={onRefresh}
                tintColor={premiumColors.brand}
                colors={[premiumColors.brand]}
              />
            ) : undefined
          }
        >
          {innerContent}
        </ScrollView>
      ) : (
        <View style={styles.flex1}>{innerContent}</View>
      )}
    </SafeAreaView>
  );
}

// ─── AppHeader ──────────────────────────────────────────────────────────────
interface AppHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function AppHeader({ eyebrow, title, subtitle, right }: AppHeaderProps) {
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(premiumColors), [premiumColors]);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.flex1}>
        {eyebrow && <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>}
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      {right && <View style={styles.headerRight}>{right}</View>}
    </View>
  );
}

// ─── HeroPanel ──────────────────────────────────────────────────────────────
interface HeroPanelProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  metric?: string;
  metricLabel?: string;
  action?: React.ReactNode;
}

export function HeroPanel({ eyebrow, title, subtitle, icon, metric, metricLabel, action }: HeroPanelProps) {
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(premiumColors), [premiumColors]);

  return (
    <View style={styles.heroPanel}>
      <View style={styles.heroAccent} />
      <View style={styles.heroHeader}>
        <View style={styles.flex1}>
          {eyebrow && <Text style={styles.heroEyebrow}>{eyebrow.toUpperCase()}</Text>}
          <Text style={styles.heroTitle}>{title}</Text>
          {subtitle && <Text style={styles.heroSubtitle}>{subtitle}</Text>}
        </View>
        {icon && (
          <View style={styles.heroIconContainer}>
            <MaterialIcons name={icon} size={24} color={premiumColors.brand} />
          </View>
        )}
      </View>

      {(metric || action) && (
        <View style={styles.heroFooter}>
          {metric ? (
            <View>
              <Text style={styles.heroMetric}>{metric}</Text>
              {metricLabel && <Text style={styles.heroMetricLabel}>{metricLabel}</Text>}
            </View>
          ) : <View />}
          {action && <View>{action}</View>}
        </View>
      )}
    </View>
  );
}

// ─── MetricCard ─────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  tone?: PremiumTone;
}

export function MetricCard({ label, value, icon, tone = 'neutral' }: MetricCardProps) {
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(premiumColors), [premiumColors]);

  const toneColor = getPremiumToneColor(tone, premiumColors);
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        {icon && <MaterialIcons name={icon} size={16} color={toneColor} />}
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

// ─── ActionTile ─────────────────────────────────────────────────────────────
interface ActionTileProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tone?: PremiumTone;
  onPress: () => void;
}

export function ActionTile({ title, subtitle, icon, tone = 'neutral', onPress }: ActionTileProps) {
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(premiumColors), [premiumColors]);

  const toneColor = getPremiumToneColor(tone, premiumColors);
  return (
    <TouchableOpacity style={styles.actionTile} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIconWrapper, { backgroundColor: toneColor + '1A' }]}>
        <MaterialIcons name={icon} size={20} color={toneColor} />
      </View>
      <Text style={styles.actionTitle} numberOfLines={1}>{title}</Text>
      {subtitle && <Text style={styles.actionSubtitle} numberOfLines={1}>{subtitle}</Text>}
    </TouchableOpacity>
  );
}

// ─── ActionGrid ─────────────────────────────────────────────────────────────
interface ActionGridProps {
  actions: ActionTileProps[];
  columns?: number;
}

export function ActionGrid({ actions, columns = 2 }: ActionGridProps) {
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(premiumColors), [premiumColors]);

  return (
    <View style={styles.actionGrid}>
      {actions.map((action, index) => (
        <View key={index} style={{ width: `${100 / columns}%`, padding: premiumSpacing[4] }}>
          <ActionTile {...action} />
        </View>
      ))}
    </View>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────
interface SectionProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

export function Section({ title, subtitle, actionLabel, onAction, children }: SectionProps) {
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(premiumColors), [premiumColors]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.flex1}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
        {actionLabel && onAction && (
          <TouchableOpacity onPress={onAction}>
            <Text style={styles.sectionAction}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

// ─── AppButton ──────────────────────────────────────────────────────────────
interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export function AppButton({ title, onPress, variant = 'primary', loading, disabled, icon }: AppButtonProps) {
  const premiumColors = usePremiumColors();
  const styles = React.useMemo(() => getStyles(premiumColors), [premiumColors]);

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';

  let backgroundColor = premiumColors.surface2;
  let textColor = premiumColors.text;
  let borderColor = premiumColors.border;

  if (isPrimary) {
    backgroundColor = premiumColors.brand;
    textColor = premiumColors.text;
    borderColor = premiumColors.brand;
  } else if (isDanger) {
    backgroundColor = premiumColors.danger + '1A';
    textColor = premiumColors.danger;
    borderColor = premiumColors.danger + '33';
  } else if (isGhost) {
    backgroundColor = 'transparent';
    borderColor = 'transparent';
  } else {
    // Secondary
    backgroundColor = premiumColors.surfaceGlassStrong;
    borderColor = premiumColors.borderGlass;
  }

  const isPrimaryButton = isPrimary && !disabled && !loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, borderColor },
        isPrimaryButton ? premiumShadows.redGlow : undefined,
        (disabled || loading) && styles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <MaterialIcons name={icon} size={18} color={textColor} style={styles.buttonIcon} />}
          <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const getStyles = (premiumColors: any) => StyleSheet.create({
  flex1: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: premiumColors.bg,
  },
  paddedContainer: {
    padding: premiumSpacing[16],
  },
  scrollContent: {
    flexGrow: 1,
  },

  // AppHeader
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: premiumSpacing[16],
    paddingVertical: premiumSpacing[16],
  },
  eyebrow: {
    fontSize: premiumTypography.sizes[11],
    fontWeight: premiumTypography.weights.bold,
    color: premiumColors.brand,
    letterSpacing: 0.5,
    marginBottom: premiumSpacing[4],
  },
  headerTitle: {
    fontSize: premiumTypography.sizes[24],
    fontWeight: premiumTypography.weights.bold,
    color: premiumColors.text,
  },
  headerSubtitle: {
    fontSize: premiumTypography.sizes[13],
    color: premiumColors.textSecondary,
    marginTop: premiumSpacing[4],
  },
  headerRight: {
    marginLeft: premiumSpacing[16],
  },

  // HeroPanel
  heroPanel: {
    backgroundColor: premiumColors.surfaceGlassStrong,
    borderRadius: premiumRadius[24],
    borderWidth: 1,
    borderColor: premiumColors.borderGlass,
    overflow: 'hidden',
    marginHorizontal: premiumSpacing[16],
    marginBottom: premiumSpacing[16],
    ...premiumShadows.glass,
  },
  heroAccent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 3,
    backgroundColor: premiumColors.brand,
  },
  heroHeader: {
    flexDirection: 'row',
    padding: premiumSpacing[16],
  },
  heroEyebrow: {
    fontSize: premiumTypography.sizes[11],
    fontWeight: premiumTypography.weights.bold,
    color: premiumColors.brand,
    letterSpacing: 0.5,
    marginBottom: premiumSpacing[4],
  },
  heroTitle: {
    fontSize: premiumTypography.sizes[20],
    fontWeight: premiumTypography.weights.bold,
    color: premiumColors.text,
  },
  heroSubtitle: {
    fontSize: premiumTypography.sizes[13],
    color: premiumColors.textSecondary,
    marginTop: premiumSpacing[4],
  },
  heroIconContainer: {
    width: 40,
    height: 40,
    borderRadius: premiumRadius[8],
    backgroundColor: premiumColors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: premiumSpacing[16],
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: premiumSpacing[16],
    paddingBottom: premiumSpacing[16],
  },
  heroMetric: {
    fontSize: premiumTypography.sizes[24],
    fontWeight: premiumTypography.weights.bold,
    color: premiumColors.text,
  },
  heroMetricLabel: {
    fontSize: premiumTypography.sizes[12],
    color: premiumColors.textMuted,
    marginTop: premiumSpacing[4],
  },

  // MetricCard
  metricCard: {
    backgroundColor: premiumColors.surfaceGlass,
    borderRadius: premiumRadius[16],
    borderWidth: 1,
    borderColor: premiumColors.borderGlass,
    padding: premiumSpacing[12],
    ...premiumShadows.subtle,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: premiumSpacing[8],
    marginBottom: premiumSpacing[8],
  },
  metricLabel: {
    fontSize: premiumTypography.sizes[12],
    color: premiumColors.textSecondary,
  },
  metricValue: {
    fontSize: premiumTypography.sizes[20],
    fontWeight: premiumTypography.weights.bold,
    color: premiumColors.text,
  },

  // ActionTile
  actionTile: {
    backgroundColor: premiumColors.surfaceGlass,
    borderRadius: premiumRadius[16],
    borderWidth: 1,
    borderColor: premiumColors.borderSoft,
    padding: premiumSpacing[12],
    alignItems: 'center',
    justifyContent: 'center',
    gap: premiumSpacing[8],
    ...premiumShadows.subtle,
  },
  actionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: premiumRadius[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: premiumTypography.sizes[13],
    fontWeight: premiumTypography.weights.medium,
    color: premiumColors.text,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: premiumTypography.sizes[11],
    color: premiumColors.textMuted,
    textAlign: 'center',
  },

  // ActionGrid
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -premiumSpacing[4],
  },

  // Section
  section: {
    marginBottom: premiumSpacing[24],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: premiumSpacing[16],
    marginBottom: premiumSpacing[16],
  },
  sectionTitle: {
    fontSize: premiumTypography.sizes[16],
    fontWeight: premiumTypography.weights.bold,
    color: premiumColors.text,
  },
  sectionSubtitle: {
    fontSize: premiumTypography.sizes[13],
    color: premiumColors.textMuted,
    marginTop: premiumSpacing[4],
  },
  sectionAction: {
    fontSize: premiumTypography.sizes[13],
    fontWeight: premiumTypography.weights.medium,
    color: premiumColors.brand,
  },

  // AppButton
  button: {
    height: 44,
    borderRadius: premiumRadius[8],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: premiumSpacing[16],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: premiumSpacing[8],
  },
  buttonIcon: {
    marginRight: -premiumSpacing[4],
  },
  buttonText: {
    fontSize: premiumTypography.sizes[14],
    fontWeight: premiumTypography.weights.bold,
  },
});
