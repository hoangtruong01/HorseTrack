import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../providers/auth-provider';

function getRoleRoute(roles: string[]): string {
  const role = (roles[0] || 'spectator').toLowerCase();
  switch (role) {
    case 'admin': return '/(admin)';
    case 'owner':
    case 'horse_owner':
      return '/(owner)';
    case 'jockey': return '/(jockey)';
    case 'referee': return '/(referee)';
    case 'counter_staff': return '/(counter)';
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
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    const timer = setTimeout(() => {
      if (!user && !inAuthGroup) {
        router.replace('/login');
      } else if (user && inAuthGroup) {
        const route = getRoleRoute(user.roles);
        router.replace(route as any);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [user, isLoading, segments, isMounted]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(spectator)" options={{ headerShown: false }} />
        <Stack.Screen name="(owner)" options={{ headerShown: false }} />
        <Stack.Screen name="(jockey)" options={{ headerShown: false }} />
        <Stack.Screen name="(referee)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(counter)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
