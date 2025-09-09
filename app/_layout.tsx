import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Amplify v6 config
import { Amplify } from 'aws-amplify';
import * as Linking from 'expo-linking';
import config from './aws-exports';

// Auth helpers
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';

// Hosted-UI needs this on Expo
import * as WebBrowser from 'expo-web-browser';
import { AuthProvider } from './context/AuthContext';
if (Platform.OS !== 'web') WebBrowser.maybeCompleteAuthSession();

// Configure  Amplify
Amplify.configure({
  ...config,
  Auth: {
    ...(config as any).Auth,
    oauth: {
      ...(config as any).Auth?.oauth ?? (config as any).oauth ?? {},
      // Needed for native (iOS/Android) Google Hosted UI
      urlOpener: async (url: string, redirectUrl: string) => {
        console.log({ url, redirectUrl });
        if (Platform.OS === 'web') return;
        const res = await WebBrowser.openAuthSessionAsync(url, redirectUrl);
        if (res.type === 'success' && res.url) await Linking.openURL(res.url);
      },
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const router = useRouter();
  const onAuthRoute = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    (async () => {
      try {
        // Now it’s safe to check the user
        await getCurrentUser(); // throws if not logged in

        const user = await fetchUserAttributes(); // a: UserAttrs

        if (user) setAuthed(true);
        if (onAuthRoute) router.replace('/(tabs)');
      } catch (err) {
        setAuthed(false);
        if (!onAuthRoute) router.replace('/login');
      } finally {
        setReady(true);
      }
    })();

    return () => {
      setReady(false);
      setAuthed(false);
    }
  }, []);

  // If now authed but sitting on /login or /signup, move to tabs.
  useEffect(() => {
    if (!ready) return;
    if (authed && onAuthRoute) {
      router.replace('/(tabs)'); // make sure app/(tabs)/index.tsx exists
    }
  }, [ready, authed, pathname, router]);

  if (!ready) {
    return (
      <AuthProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </AuthProvider>
    );
  }

  // Render different stacks based on auth instead of Redirect loops
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          {authed ? (
            <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
          ) : (
            <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
              {/* make sure app/login.tsx and app/signup.tsx exist */}
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" options={{ headerShown: true, title: 'Create account' }} />
            </Stack>
          )}
        </ThemeProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
