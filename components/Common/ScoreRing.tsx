// ScoreRing.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ThemedText } from "../ThemedText";

type Props = {
    score: number;
    total: number;
    size?: number;        // outer size
    strokeWidth?: number; // ring thickness
    trackColor?: string;
    progressColor?: string;
    showText?: boolean;
};

export default function ScoreRing({
    score,
    total,
    size = 112,
    strokeWidth = 4,
    trackColor = "#e5e7eb",   // slate-200
    progressColor = "#16a34a",// green-600
    showText = true,
}: Props) {
    const pct = total > 0 ? Math.max(0, Math.min(1, score / total)) : 0;
    const half = size / 2;
    const r = half - strokeWidth / 2;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - pct); // 0% = full offset (no arc), 100% = 0 offset

    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
                {/* Track */}
                <Circle
                    cx={half}
                    cy={half}
                    r={r}
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress (rotated so it starts at 12 o'clock) */}
                <Circle
                    cx={half}
                    cy={half}
                    r={r}
                    stroke={progressColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${c} ${c}`}
                    strokeDashoffset={offset}
                    fill="none"
                    transform={`rotate(-90 ${half} ${half})`}
                />
            </Svg>

            {showText && (
                <View style={styles.center}>
                    <ThemedText type="title">
                        {Math.round(pct * 100)}%
                    </ThemedText>
                    <ThemedText style={{ opacity: 0.6 }}>
                        {score}/{total}
                    </ThemedText>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
    },
});
