// components/TopNavLayout.tsx
import Button from '@/components/Common/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TopNavLayout({
    children,
    onBack,
    onNext,
    isChoiceSelected,
    isSubmit,
    stage
}: {
    children: React.ReactNode;
    onBack?: () => void;
    onNext?: () => void;
    isChoiceSelected?: boolean;
    isSubmit?: boolean;
    stage?: "passage" | "question" | "submitted";
}) {
    const router = useRouter();
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <View style={styles.container}>
                {/* Top bar */}
                <View style={[styles.topBar, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                    <Button text="Back" onPress={onBack || (() => router.back())} disabled={!onBack} />

                    {stage !== "submitted" ? (
                        <Button
                            text={isSubmit ? "Submit" : "Next"}
                            onPress={onNext || (() => router.push('/next'))}
                            disabled={!onNext && !isChoiceSelected}
                        />
                    ) : (
                        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.btnIcon}>
                            <IconSymbol size={24} name="house.fill" color={''} />
                        </TouchableOpacity>
                    )}

                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    <ScrollView>
                        {children}
                    </ScrollView>
                </View>
            </View>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#b9b9b9'
    },
    btn: { padding: 8 },
    content: { flex: 1, backgroundColor: "#fff" },
    btnIcon: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, alignItems: "center" },
    btnDisabled: { opacity: 0.5 },
});
