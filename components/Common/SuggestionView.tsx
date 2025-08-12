import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import PassageReadAlong from "./PassageReadAlong";

type Suggestion = { word: string; definition: string };
export type SuggestionsPayload = { vocabulary: Suggestion[]; grammarTip: string };

export default function SuggestionsView({
    suggestions,
    onClose,
    title = "Study Suggestions",
    passage = null,
    passageTitle = null, // optional passage title for context
}: {
    suggestions: SuggestionsPayload;
    onClose?: () => void;
    title?: string;
    passage?: string | null; // optional passage text for context,
    passageTitle: string | null; // optional title for the passage
}) {
    const hasVocab = suggestions?.vocabulary?.length > 0;
    const hasTip = !!suggestions?.grammarTip;

    return (
        <SafeAreaView style={styles.root}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.body, { flexGrow: 1 }]} // <-- fills remaining height
            >
                {/* Header */}
                <ThemedView style={styles.headerRow}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Ionicons name="bulb-outline" size={22} />
                        <ThemedText type="title">{title}</ThemedText>
                    </View>
                    {onClose && <Ionicons name="close" size={22} onPress={onClose} />}
                </ThemedView>


                {passage && (
                    <ThemedView style={styles.card}>
                        <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
                            {passageTitle || "Reading Passage"}
                        </ThemedText>
                        <PassageReadAlong text={passage} />
                    </ThemedView>
                )}

                {/* Vocabulary */}
                <ThemedView style={styles.card}>
                    <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
                        Vocabulary to Review
                    </ThemedText>
                    {!hasVocab && <ThemedText style={styles.muted}>No vocabulary suggestions.</ThemedText>}
                    {hasVocab && (
                        <View style={{ gap: 10 }}>
                            {suggestions.vocabulary.map((v, idx) => (
                                <View key={`${v.word}-${idx}`} style={styles.vocabItem}>
                                    <View style={styles.vocabBadge}>
                                        <ThemedText style={{ textAlign: "center" }}>{idx + 1}</ThemedText>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <ThemedText type="defaultSemiBold">{v.word}</ThemedText>
                                        <ThemedText style={styles.definition}>{v.definition}</ThemedText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </ThemedView>

                {/* Grammar Tip */}
                <ThemedView style={styles.card}>
                    <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
                        Grammar Tip
                    </ThemedText>
                    {hasTip ? (
                        <View style={styles.tipRow}>
                            <Ionicons name="checkmark-circle-outline" size={18} />
                            <ThemedText style={{ flex: 1 }}>{suggestions.grammarTip}</ThemedText>
                        </View>
                    ) : (
                        <ThemedText style={styles.muted}>No grammar tip.</ThemedText>
                    )}
                </ThemedView>

                {/* Optional spacer to push content bottom when short */}
                <View style={{ flex: 1 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#ffffff' },             // <— screen fills viewport
    scroll: { flex: 1 },           // <— scroll view fills parent
    body: { padding: 16, gap: 16 },// your existing body styles
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    card: { padding: 14, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: 8 },
    muted: { opacity: 0.7 },
    vocabItem: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
    vocabBadge: {
        width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center",
        borderWidth: StyleSheet.hairlineWidth, marginTop: 2,
    },
    definition: { opacity: 0.85, marginTop: 2 },
    tipRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
    passage: { lineHeight: 22 },
});