import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "../ThemedText";

export default function Button({ text, onPress, disabled = false }: { text: string; onPress: () => void; disabled?: boolean }) {
    return (
        <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.btn, disabled && styles.btnDisabled]}>
            <ThemedText type="defaultSemiBold">{text}</ThemedText>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, alignItems: "center" },
    btnDisabled: { opacity: 0.5 },
});
