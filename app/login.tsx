// app/login.tsx
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

// Amplify v6 imports (modular)
import PasswordInput from '@/components/FormFields/PasswordInput';
import { signIn, signInWithRedirect, signOut } from '@aws-amplify/auth';

export default function LoginScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function onGoogle() {
        try {
            // Hosted UI redirect (Google)
            await signInWithRedirect({ provider: 'Google' });
            router.replace('/(tabs)');
        } catch (e: any) {
            console.error('onGoogle', e);
            if (e?.name === 'UserAlreadyAuthenticatedException') {
                // B) or force re-auth:
                await signOut(); // or signOut({ global: true })
                onGoogle();
                return;
            }

            Alert.alert('Google login failed', e?.message ?? 'Unknown error');
        }
    }

    async function onNativeLogin() {
        try {
            await signIn({ username, password });
            router.replace('/(tabs)'); // go to app after login
        } catch (e: any) {
            console.error(e);
            Alert.alert('Login failed', e?.message ?? 'Unknown error');
        }
    }

    return (
        <View style={s.container}>
            <Text style={s.title}>Daily English</Text>
            <Text style={s.subtitle}>Sign in to continue</Text>

            {/* Google button */}
            <Pressable style={s.googleBtn} onPress={onGoogle}>
                <AntDesign name="google" size={18} style={{ marginRight: 8 }} />
                <Text style={s.googleText}>Sign in with Google</Text>
            </Pressable>

            <View style={s.dividerWrap}>
                <View style={s.line} />
                <Text style={s.divider}>or</Text>
                <View style={s.line} />
            </View>

            {/* Native login */}
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                style={s.input}
            />
            <PasswordInput value={password} onChangeText={setPassword} />

            <Pressable style={s.primaryBtn} onPress={onNativeLogin}>
                <Text style={s.primaryText}>Sign in</Text>
            </Pressable>

            <Pressable style={s.linkBtn} onPress={() => router.push('/signup')}>
                <Text style={s.linkText}>Create account</Text>
            </Pressable>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, gap: 14 },
    title: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 8 },
    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 12,
    },
    googleText: { fontSize: 16, fontWeight: '600' },
    dividerWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
    divider: { color: '#888' },
    line: { flex: 1, height: 1, backgroundColor: '#e5e5e5' },
    input: {
        fontSize: 16,
        height: 48, borderColor: '#ddd', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#fff'
    },
    primaryBtn: { backgroundColor: '#111827', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    primaryText: { color: 'white', fontWeight: '700', fontSize: 16 },
    linkBtn: { alignItems: 'center', paddingVertical: 6 },
    linkText: { color: '#2563eb', fontWeight: '600' },
});
