import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Appearance } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { AppScreen, Section } from '@/components/ui/premium';
import { premiumColors, premiumSpacing, premiumRadius, usePremiumColors } from '@/components/ui/premium-tokens';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = usePremiumColors();
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');

  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const res = localStorage.getItem('app_theme_mode');
        if (res === 'light' || res === 'dark' || res === 'system') {
          setThemeMode(res);
        }
      } catch (e) {}
    } else {
      SecureStore.getItemAsync('app_theme_mode')
        .then((res) => {
          if (res === 'light' || res === 'dark' || res === 'system') {
            setThemeMode(res);
          }
        })
        .catch(() => {});
    }
  }, []);

  const changeThemeMode = (mode: 'system' | 'light' | 'dark') => {
    setThemeMode(mode);
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem('app_theme_mode', mode);
      } catch (e) {}
    } else {
      SecureStore.setItemAsync('app_theme_mode', mode).catch(() => {});
    }

    if (typeof Appearance.setColorScheme === 'function') {
      try {
        Appearance.setColorScheme(mode === 'system' ? null : mode);
      } catch (e) {}
    }
  };

  return (
    <AppScreen scroll>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={[styles.backBtn, { borderColor: theme.borderSoft }]} onPress={() => router.back()} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back" size={20} color={theme.textSecondary} />
          <Text style={[styles.backTxt, { color: theme.textSecondary }]}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Cài đặt ứng dụng</Text>
      </View>

      <View style={styles.content}>
        <Section title="Giao diện hiển thị">
          <View style={[styles.themeSelectorContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {(['system', 'light', 'dark'] as const).map((mode) => {
              const isSelected = themeMode === mode;
              const labels = { system: 'Hệ thống', light: 'Sáng', dark: 'Tối' };
              const icons = { system: 'brightness-auto', light: 'light-mode', dark: 'dark-mode' };
              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeOptionBtn,
                    {
                      backgroundColor: isSelected ? theme.surface2 : 'transparent',
                      borderColor: isSelected ? theme.borderStrong : 'transparent',
                    },
                  ]}
                  onPress={() => changeThemeMode(mode)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={icons[mode] as any}
                    size={24}
                    color={isSelected ? theme.brand : theme.textMuted}
                    style={{ marginBottom: 8 }}
                  />
                  <Text
                    style={[
                      styles.themeOptionText,
                      {
                        fontWeight: isSelected ? '700' : '500',
                        color: isSelected ? theme.text : theme.textMuted,
                      },
                    ]}
                  >
                    {labels[mode]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: premiumSpacing[16],
    gap: premiumSpacing[12],
    borderBottomWidth: 1,
    marginBottom: premiumSpacing[16],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: premiumRadius[8],
    borderWidth: 1,
  },
  backTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  content: {
    paddingHorizontal: premiumSpacing[16],
    paddingBottom: premiumSpacing[48],
  },
  themeSelectorContainer: {
    flexDirection: 'row',
    borderRadius: premiumRadius[12],
    padding: premiumSpacing[8],
    borderWidth: 1,
    gap: premiumSpacing[8],
  },
  themeOptionBtn: {
    flex: 1,
    paddingVertical: premiumSpacing[16],
    alignItems: 'center',
    borderRadius: premiumRadius[8],
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 13,
  },
});
