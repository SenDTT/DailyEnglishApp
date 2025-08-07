// app/(tabs)/profile.tsx
import { fetchUserAttributes, getCurrentUser, signOut } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
// app/(tabs)/profile.tsx (inside component)
import { useNavigation } from 'expo-router';

type UserAttrs = Awaited<ReturnType<typeof fetchUserAttributes>>; // TS infers the right shape

export default function ProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [attrs, setAttrs] = useState<UserAttrs | null>(null);

    const nav = useNavigation();
    useEffect(() => {
        nav.setOptions({
            headerRight: () => (
                <Pressable onPress={async () => { await signOut(); router.replace('/login'); }}>
                    <Text style={{ color: '#2563eb', fontWeight: '600' }}>Logout</Text>
                </Pressable>
            ),
        });
    }, [nav, router]);

    useEffect(() => {
        (async () => {
            try {
                await getCurrentUser(); // throws if not logged in
                const a = await fetchUserAttributes(); // a: UserAttrs
                setAttrs(a);
            } catch {
                router.replace('/login');
            } finally {
                setLoading(false);
            }
        })();
    }, [router]);

    async function onLogout() {
        try {
            await signOut();
            router.replace('/login');
        } catch (e) {
            console.log('Sign out error:', e);
        }
    }

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={s.wrap}>
            <Text style={s.title}>Profile</Text>

            <View style={s.card}>
                <Row label="Username" value={attrs?.preferred_username || attrs?.nickname || '—'} />
                <Row label="Email" value={attrs?.email || '—'} />
                <Row label="Phone" value={attrs?.phone_number || '—'} />
            </View>

            <Pressable style={s.logoutBtn} onPress={onLogout}>
                <Text style={s.logoutText}>Log out</Text>
            </Pressable>
        </View>
    );
}

function Row({ label, value }: { label: string; value?: string }) {
    return (
        <View style={s.row}>
            <Text style={s.label}>{label}</Text>
            <Text style={s.value}>{value ?? '—'}</Text>
        </View>
    );
}

const s = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    wrap: { flex: 1, padding: 16, gap: 16 },
    title: { fontSize: 24, fontWeight: '700' },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 10, borderColor: '#eee', borderWidth: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { color: '#555' },
    value: { fontWeight: '600' },
    logoutBtn: { backgroundColor: '#111827', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
    logoutText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
