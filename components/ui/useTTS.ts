// useTTS.ts
import { useCallback, useState } from "react";
import * as Speech from "expo-speech";

export function useTTS(defaultOptions: Partial<Speech.SpeechOptions> = {}) {
    const [speaking, setSpeaking] = useState(false);

    const speak = useCallback((text: string, options: Partial<Speech.SpeechOptions> = {}) => {
        Speech.speak(text, {
            onStart: () => setSpeaking(true),
            onDone: () => setSpeaking(false),
            onStopped: () => setSpeaking(false),
            onError: () => setSpeaking(false),
            rate: 0.95,
            pitch: 1.0,
            ...defaultOptions,
            ...options,
        });
    }, [defaultOptions]);

    const stop = useCallback(() => {
        Speech.stop();
        setSpeaking(false);
    }, []);

    const voices = () => Speech.getAvailableVoicesAsync();
    const isSpeaking = () => Speech.isSpeakingAsync();

    return { speak, stop, speaking, voices, isSpeaking };
}
