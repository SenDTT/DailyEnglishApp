import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useTTS } from "../ui/useTTS";

export default function ReadAloud({ text }: { text: string }) {
    const { speak, stop, speaking } = useTTS({ language: "en-US" });

    return (
        <TouchableOpacity
            onPress={() => (speaking ? stop() : speak(text))}
            accessibilityRole="button"
            accessibilityLabel={speaking ? "Stop speaking" : "Listen"}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ padding: 12, borderRadius: 12 }}
        >
            <Ionicons
                // Option A: speaker vs stop
                name={speaking ? "stop-circle" : "volume-high"}
                // Option B (round buttons): "play-circle" when idle
                // name={speaking ? "stop-circle" : "play-circle"}
                size={26}
            />
        </TouchableOpacity>
    );
}
