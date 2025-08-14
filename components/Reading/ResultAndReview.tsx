import { ReadingData } from "@/app/(reading)/reading";
import { useState } from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import ScoreRing from "../Common/ScoreRing";
import SuggestionsView, { SuggestionsPayload } from "../Common/SuggestionView";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

export default function ResultAndReview({
    data,
    score,
    answers,
    suggestions,
    title,
    isShowPassages = false,
}: {
    data: ReadingData;
    score: number;
    answers: Record<number, string>;
    suggestions: SuggestionsPayload;
    title?: string;
    isShowPassages?: boolean; // optional prop to show/hide passages
}) {
    const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);
    const [open, setOpen] = useState(false);

    return (
        <ThemedView style={[styles.card, { gap: 12 }]}>
            {/* Header + Score */}
            <ThemedText type="subtitle">{title ?? "Results"}</ThemedText>
            <View style={styles.summaryRow}>
                <ScoreRing
                    score={score}
                    total={data.quiz.length}
                    progressColor="#22c55e" // optional
                    trackColor="#e5e7eb"    // optional
                />

                <View style={{ flex: 1, gap: 6 }}>
                    <ThemedText style={{ opacity: 0.8 }}>
                        Review your answers. Green is the correct option. Red is your selected wrong option.
                    </ThemedText>

                    {/* Filter chips */}
                    <View style={styles.chipsRow}>
                        <TouchableOpacity
                            onPress={() => setShowOnlyIncorrect(false)}
                            style={[styles.chip, !showOnlyIncorrect && styles.chipActive]}
                        >
                            <ThemedText>All</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowOnlyIncorrect(true)}
                            style={[styles.chip, showOnlyIncorrect && styles.chipActive]}
                        >
                            <ThemedText>Incorrect only</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ThemedText type="defaultSemiBold">Review</ThemedText>

            {/* Scrollable review area */}
            <View style={{ paddingBottom: 20 }}>
                {data.quiz
                    .map((q, i) => ({ q, i, user: answers[i] ? answers[i].charAt(0) : '', correct: answers[i] && answers[i].charAt(0) === q.answer }))
                    .filter(x => (showOnlyIncorrect ? !x.correct : true))
                    .map(({ q, i, user, correct }) => (
                        <ThemedView key={i} style={[styles.qCard, correct ? styles.qCardOk : styles.qCardBad]}>
                            {/* Row: icon + question */}
                            <View style={styles.qHeader}>
                                <ThemedText type="defaultSemiBold" style={{ ...styles.qBadge, color: correct ? 'green' : 'red' }}>
                                    {correct ? "✓" : "✗"}
                                </ThemedText>
                                <ThemedText style={{ flex: 1 }}>
                                    {i + 1}. {q.question}
                                </ThemedText>
                            </View>

                            {/* Options with color states */}
                            <View style={{ gap: 8, marginTop: 6 }}>
                                {q.options.map((opt) => {
                                    const isCorrect = opt.charAt(0) === q.answer;
                                    const isUserWrongPick = opt.charAt(0) === user && user !== q.answer;

                                    return (
                                        <View
                                            key={opt}
                                            style={[
                                                styles.optRow,
                                                isCorrect && styles.optCorrect,
                                                !isCorrect && isUserWrongPick && styles.optWrong
                                            ]}
                                        >
                                            <ThemedText style={{ flex: 1 }}>{opt}</ThemedText>

                                            {isCorrect && (
                                                <View style={[styles.tag, styles.tagOk]}>
                                                    <ThemedText style={styles.tagText}>Correct</ThemedText>
                                                </View>
                                            )}
                                            {isUserWrongPick && (
                                                <View style={[styles.tag, styles.tagBad]}>
                                                    <ThemedText style={styles.tagText}>Your choice</ThemedText>
                                                </View>
                                            )}
                                            {isCorrect && opt.charAt(0) === user && user === q.answer && (
                                                <View style={[styles.tag, styles.tagOk]}>
                                                    <ThemedText style={styles.tagText}>Your choice</ThemedText>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </ThemedView>
                    ))}
            </View>

            <View style={styles.controls}>
                <TouchableOpacity onPress={() => setOpen(true)} style={[styles.mBtn, styles.mBtnSecondary]}>
                    <ThemedText>See Suggestions</ThemedText>
                </TouchableOpacity>
            </View>

            <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
                <View style={styles.overlay}>
                    <View style={styles.sheet}>
                        <View style={styles.grabber} />
                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator
                            keyboardShouldPersistTaps="handled"
                        >
                            <SuggestionsView suggestions={suggestions} passageTitle={isShowPassages ? data.title : null} passage={isShowPassages ? data.passage : null} onClose={() => setOpen(false)} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    largeMuted: { fontSize: 20 },
    smallMuted: { opacity: 0.7, fontSize: 14 },
    card: { padding: 12, marginBottom: 16 },
    passage: { lineHeight: 22 },
    option: { padding: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
    optionSelected: { borderWidth: 4, borderColor: "green" },
    controls: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
    center: { alignItems: "center", justifyContent: "center" },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    modalCard: {
        width: "100%",
        borderRadius: 16,
        padding: 16,
        borderWidth: StyleSheet.hairlineWidth,
    },
    modalActions: {
        marginTop: 16,
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    mBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
    mBtnSecondary: {},
    mBtnDanger: { borderWidth: 2 },
    summaryRow: { flexDirection: "row", gap: 12, alignItems: "center" },
    scoreCircle: {
        width: 88, height: 88, borderRadius: 999,
        alignItems: "center", justifyContent: "center",
        borderWidth: 2,
    },

    chipsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
    chip: {
        paddingVertical: 8, paddingHorizontal: 12,
        borderRadius: 999, borderWidth: StyleSheet.hairlineWidth,
    },
    chipActive: { borderWidth: 2 },
    qCard: { padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: StyleSheet.hairlineWidth },
    qCardOk: {},
    qCardBad: {},
    qHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    qBadge: {
        width: 24, height: 24, textAlign: "center", textAlignVertical: "center",
        borderRadius: 999, borderWidth: StyleSheet.hairlineWidth,
    },
    optRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
    },
    optCorrect: { borderWidth: 2, borderColor: 'green' },
    optWrong: { borderWidth: 2, borderColor: "red" },
    tag: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
    },
    tagOk: {
        borderColor: "green"
    },
    tagBad: {
        borderColor: "red"
    },
    tagText: { fontSize: 12 },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end", // or "center" if you want a centered card
    },
    sheet: {
        maxHeight: "90%",     // <-- lets the ScrollView have room to scroll
        width: "100%",
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
    },
    grabber: {
        alignSelf: "center",
        width: 48,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#ccc",
        marginBottom: 8,
    },
    scrollContent: {
        paddingBottom: 24,    // space so content isn’t hidden behind the Close button
    },
    closeBtn: {
        marginTop: 8,
        alignSelf: "center",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: "#eee",
    },
    closeTxt: { fontWeight: "600" },
});
