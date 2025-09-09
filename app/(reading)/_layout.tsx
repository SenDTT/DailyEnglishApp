import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
    const colorScheme = useColorScheme();

    // Render different stacks based on auth instead of Redirect loops
    return (
        <AuthProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(reading)" />
                </Stack>
            </ThemeProvider>
        </AuthProvider>
    );
}
