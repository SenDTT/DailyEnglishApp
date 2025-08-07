import PasswordInput from '@/components/FormFields/PasswordInput';
import { AntDesign } from '@expo/vector-icons';
import { confirmSignUp, signInWithRedirect, signUp } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SignupScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('+1');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [confirmPhase, setConfirmPhase] = useState(false);

    async function onSignUp() {
        try {
            await signUp({
                username,
                password,
                options: { userAttributes: { phone_number: phone, email, nickname: username } },
            });
            setConfirmPhase(true);
            Alert.alert('Confirmation code sent');
        } catch (e: any) {
            console.log('Amplify error:', e?.name, e?.message, e);
            Alert.alert('Sign up failed', e?.message ?? 'Unknown error');
        }
    }

    async function onConfirm() {
        try {
            await confirmSignUp({ username, confirmationCode: code });
            Alert.alert('Account confirmed!');
            router.replace('/login');
        } catch (e: any) {
            Alert.alert('Confirm failed', e?.message ?? 'Unknown error');
        }
    }

    async function onGoogle() {
        try {
            // Hosted UI redirect (Google)
            await signInWithRedirect({ provider: 'Google' });
        } catch (e: any) {
            console.error(e);
            Alert.alert('Google login failed', e?.message ?? 'Unknown error');
        }
    }

    return (
        <View style={ss.container}>
            <Text style={ss.title}>Create account</Text>

            {/* Google button */}
            <Pressable style={ss.googleBtn} onPress={onGoogle}>
                <AntDesign name="google" size={18} style={{ marginRight: 8 }} />
                <Text style={ss.googleText}>Sign in with Google</Text>
            </Pressable>

            <View style={ss.dividerWrap}>
                <View style={ss.line} />
                <Text style={ss.divider}>or</Text>
                <View style={ss.line} />
            </View>

            {!confirmPhase ? (
                <>
                    <TextInput
                        style={ss.input}
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={ss.input}
                        placeholder="Phone (+1234567890)"
                        value={phone}
                        onChangeText={setPhone}
                    />
                    <TextInput
                        style={ss.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                    <PasswordInput value={password} onChangeText={setPassword} />
                    <Pressable style={ss.primaryBtn} onPress={onSignUp}>
                        <Text style={ss.primaryText}>Sign up</Text>
                    </Pressable>
                </>
            ) : (
                <>
                    <TextInput
                        style={ss.input}
                        placeholder="Confirmation code"
                        value={code}
                        onChangeText={setCode}
                    />
                    <Pressable style={ss.primaryBtn} onPress={onConfirm}>
                        <Text style={ss.primaryText}>Confirm</Text>
                    </Pressable>
                </>
            )}

            {/* Back to Login link */}
            <Pressable onPress={() => router.replace('/login')} style={ss.linkBtn}>
                <Text style={ss.linkText}>Already have an account? Log in</Text>
            </Pressable>
        </View>
    );
}

const ss = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, gap: 14 },
    title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
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
        height: 48,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    primaryBtn: {
        backgroundColor: '#111827',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    primaryText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    linkBtn: { marginTop: 10, alignItems: 'center' },
    linkText: { color: '#3B82F6', fontSize: 14, fontWeight: '500' },
});
