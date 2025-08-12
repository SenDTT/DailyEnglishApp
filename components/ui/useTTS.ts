// useTTS.ts
import * as Speech from "expo-speech";
import { useCallback, useEffect, useState } from "react";

export function useTTS(defaultOptions: Partial<Speech.SpeechOptions> = {}) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      Speech.stop();
      setSpeaking(false);
    };
  }, []);

  const speak = useCallback(
    (text: string, options: Partial<Speech.SpeechOptions> = {}) => {
      Speech.speak(text, {
        onStart: () => setSpeaking(true),
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
        onError: () => setSpeaking(false),
        rate: 0.95,
        pitch: 1.0,
        voice: "Enhanced", // Use default voice
        ...defaultOptions,
        ...options,
      });
    },
    [defaultOptions]
  );

  const stop = useCallback(() => {
    Speech.stop();
    setSpeaking(false);
  }, []);

  const voices = () => Speech.getAvailableVoicesAsync();
  const isSpeaking = () => Speech.isSpeakingAsync();

  return { speak, stop, speaking, voices, isSpeaking };
}
