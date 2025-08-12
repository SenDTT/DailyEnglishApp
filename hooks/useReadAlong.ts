// useReadAlong.ts (Expo)
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Speech from "expo-speech";

export function useReadAlong(
  text: string,
  opts: Partial<Speech.SpeechOptions> = {}
) {
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState<number>(-1);
  const sentences = useMemo(
    () => (text ? text.match(/[^.!?]+[.!?]*/g) ?? [text] : []),
    [text]
  );
  const cancelledRef = useRef(false);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    Speech.stop();
    setPlaying(false);
    setIdx(-1);
  }, []);

  useEffect(() => stop, [stop]); // stop on unmount

  const play = useCallback(() => {
    if (!sentences.length) return;
    stop(); // reset any in-flight speech
    cancelledRef.current = false;
    setPlaying(true);

    const speakOne = (i: number) => {
      if (cancelledRef.current || i >= sentences.length) {
        setPlaying(false);
        setIdx(-1);
        return;
      }
      setIdx(i);
      Speech.speak(sentences[i], {
        rate: 0.95,
        pitch: 1.0,
        ...opts,
        onDone: () => speakOne(i + 1),
        onStopped: () => stop(),
        onError: () => stop(),
      });
    };

    speakOne(0);
  }, [opts, sentences, stop]);

  return { play, stop, playing, currentSentenceIndex: idx, sentences };
}
