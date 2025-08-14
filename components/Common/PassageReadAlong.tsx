// PassageReadAlong.tsx
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useReadAlong } from "../../hooks/useReadAlong";

export default memo(function PassageReadAlong({ text }: { text: string }) {
    const { play, stop, playing, currentSentenceIndex, sentences } = useReadAlong(text);

    return (
        <View style={{ gap: 12 }}>
            <TouchableOpacity
                onPress={() => (playing ? stop() : play())}
                style={{ alignSelf: "flex-start", padding: 10, borderRadius: 12, backgroundColor: "#eee" }}
                accessibilityLabel={playing ? "Stop reading" : "Start reading"}
            >
                <Ionicons name={playing ? "stop-circle" : "volume-high"} size={24} />
            </TouchableOpacity>

            <Text style={styles.passageText}>
                {sentences.map((s, i) => (
                    <Text
                        key={i}
                        style={i === currentSentenceIndex ? { backgroundColor: "rgba(34,197,94,0.18)" } : undefined}
                    >
                        {s.trim()}{" "}
                    </Text>
                ))}
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    passageText: {
        lineHeight: 22,
        fontSize: 16,
        color: "#333",
        marginTop: 8,
        paddingHorizontal: 8,
        borderRadius: 8,
        //maxHeight: 200,
    }
});
