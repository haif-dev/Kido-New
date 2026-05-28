import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@app/ui/tokens';
import '../lib/i18n';
import { useSession } from '../lib/auth';

void SplashScreen.preventAutoHideAsync();

// Sends signed-in users into the tab app and keeps signed-out users in the
// public flow (welcome / onboarding / auth). Runs whenever auth state changes.
function useAuthGate(ready: boolean) {
  const { session, loading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready || loading) return;
    const inTabs = segments[0] === '(tabs)';
    if (session && !inTabs) router.replace('/search');
    else if (!session && inTabs) router.replace('/auth');
  }, [ready, loading, session, segments]);

  return loading;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    'Fraunces': 'https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&display=swap',
    'Manrope':  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap',
    'Tajawal':  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap',
  });

  const sessionLoading = useAuthGate(loaded);

  useEffect(() => {
    if (loaded && !sessionLoading) void SplashScreen.hideAsync();
  }, [loaded, sessionLoading]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
        }}
      />
    </SafeAreaProvider>
  );
}