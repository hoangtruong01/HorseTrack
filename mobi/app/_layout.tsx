import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../providers/auth-provider';

import * as SecureStore from 'expo-secure-store';
import { Appearance, Platform } from 'react-native';

function getRoleRoute(roles: string[]): string {
  const role = (roles[0] || 'spectator').toLowerCase();
  switch (role) {
    case 'admin':
    case 'counter_staff':
      return '/not-supported';
    case 'owner':
    case 'horse_owner':
      return '/(owner)';
    case 'jockey': return '/(jockey)';
    case 'referee': return '/(referee)';
    case 'spectator':
    default: return '/(spectator)';
  }
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    const applyTheme = (res: string | null) => {
      if (res === 'light' || res === 'dark' || res === 'system') {
        if (typeof Appearance.setColorScheme === 'function') {
          try { Appearance.setColorScheme(res === 'system' ? null : (res as 'light' | 'dark')); } catch (e) {}
        }
      }
    };

    if (Platform.OS === 'web') {
      try {
        applyTheme(localStorage.getItem('app_theme_mode'));
      } catch (e) {}
    } else {
      SecureStore.getItemAsync('app_theme_mode').then(applyTheme).catch(() => {});
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    const segs = segments as string[];
    const inAuthGroup = segs[0] === '(auth)';
    const topSegment = segs[0];

    const timer = setTimeout(() => {
      if (!user && !inAuthGroup) {
        router.replace('/login');
      } else if (user) {
        if (inAuthGroup) {
          const route = getRoleRoute(user.roles);
          router.replace(route as any);
        } else if (topSegment && topSegment.startsWith('(') && topSegment.endsWith(')')) {
          const requiredRole = topSegment.slice(1, -1);
          const userRoles = user.roles.map(r => r.toLowerCase());
          
          let hasAccess = false;
          if (requiredRole === 'referee') {
            hasAccess = userRoles.includes('referee');
          } else if (requiredRole === 'jockey') {
            hasAccess = userRoles.includes('jockey');
          } else if (requiredRole === 'owner') {
            hasAccess = userRoles.includes('owner') || userRoles.includes('horse_owner');
          } else if (requiredRole === 'spectator' || requiredRole === 'tabs') {
            const isProfileRoute = segs.length > 1 && segs[1] === 'profile';
            if (isProfileRoute) {
              hasAccess = true;
            } else {
              const isSpecialRole = userRoles.includes('referee') || userRoles.includes('jockey') || userRoles.includes('owner') || userRoles.includes('horse_owner');
              hasAccess = !isSpecialRole;
            }
          } else {
            hasAccess = true;
          }

          if (!hasAccess && requiredRole !== 'auth') {
             const route = getRoleRoute(user.roles);
             router.replace(route as any);
          }
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [user, isLoading, segments, isMounted, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(spectator)" options={{ headerShown: false }} />
        <Stack.Screen name="(owner)" options={{ headerShown: false }} />
        <Stack.Screen name="(jockey)" options={{ headerShown: false }} />
        <Stack.Screen name="(referee)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
