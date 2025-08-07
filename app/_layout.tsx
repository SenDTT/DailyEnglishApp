import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

// Amplify v6 config
import { Amplify } from 'aws-amplify';
import config from './aws-exports';

// Auth helpers
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';

// Hosted-UI needs this on Expo
import * as WebBrowser from 'expo-web-browser';
WebBrowser.maybeCompleteAuthSession(); // <- important for Android/Expo

Amplify.configure(config);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser(); // throws if not logged in

        const user = await fetchUserAttributes(); // a: UserAttrs
        console.log('fetchUserAttributes', user);
        setAuthed(true);
      } catch (err) {
        console.log('Error: ', err, authed);
        setAuthed(false);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!authed && pathname !== '/login' && pathname !== '/signup') {
    return <Redirect href="/login" />;
  }

  // Render different stacks based on auth instead of Redirect loops
  return (
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
  );
}
