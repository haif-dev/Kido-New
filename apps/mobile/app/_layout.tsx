import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@app/ui/tokens';
import '../lib/i18n';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'Fraunces': 'https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&display=swap',
    'Manrope':  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap',
    'Tajawal':  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap',
  });

  useEffect(() => {
    if (loaded) void SplashScreen.hideAsync();
  }, [loaded]);

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
