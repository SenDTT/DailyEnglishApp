import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

export default function PasswordInput({ value, onChangeText }: { value: string; onChangeText: (v: string) => void }) {
    const [showPassword, setShowPassword] = useState(true);

    return (
        <View style={styles.wrapper}>
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={showPassword}
                autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#888" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 48,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        fontSize: 16,
        backgroundColor: '#fff',
    },
});
