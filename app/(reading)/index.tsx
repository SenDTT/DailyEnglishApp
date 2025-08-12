import { ActivityIndicator, BackHandler, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { SuggestionsPayload } from '@/components/Common/SuggestionView';
import ModalSubmitConfirm from '@/components/Reading/ModalSubmitConfirm';
import ResultAndReview from '@/components/Reading/ResultAndReview';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fetchAuthSession } from "aws-amplify/auth";
import axios from 'axios';
import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TopNavLayout from './TopNavLayout';

const API_BASE: string =
    (Constants.expoConfig?.extra as any)?.API_BASE ??
    (Constants.manifest2?.extra as any)?.API_BASE; // fallback for web/older

export interface ReadingData {
    date: string,
    title: string,
    passage: string,
    vocabulary: string[],
    quiz: IQuizObject[],
}

export interface IQuizObject {
    question: string,
    options: string[],
    answer: string,
}

export default function HomeScreen() {
    const router = useRouter();
    const [data, setData] = useState<ReadingData>({
        date: (new Date()).toUTCString(),
        title: '',
        passage: '',
        vocabulary: [],
        quiz: [],
    });
    const { token } = useAuth();

    // "intro" | "passage" | "question" | "submitted"
    const [stage, setStage] = useState<"passage" | "question" | "submitted">("passage");
    const [loading, setLoading] = useState<boolean>(true);
    const [qIndex, setQIndex] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [selectedAnswer, setSelectedAnswer] = useState<boolean>(false);
    const [showExit, setShowExit] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [suggestions, setSuggestions] = useState<SuggestionsPayload | null>(null);

    const unansweredIdx =
        data ? data.quiz.map((_, i) => (answers[i] ? -1 : i)).filter(i => i !== -1) : [];

    const openSubmitModal = () => setShowSubmit(true);
    const closeSubmitModal = () => setShowSubmit(false);

    const goToFirstUnanswered = () => {
        if (unansweredIdx.length > 0) {
            setStage("question");
            setQIndex(unansweredIdx[0]);
            setShowSubmit(false);
        }
    };

    const confirmSubmit = async () => {
        setSubmitting(true);
        try {
            const allScore = Object.entries(answers).reduce((acc, [i, val]) => (data.quiz[Number(i)].answer === val.charAt(0) ? acc + 1 : acc), 0);
            const response = await axios.post(API_BASE + '/submitResult', { score: allScore, answers: Object.values(answers) }, {
                headers: {
                    Authorization: 'Bearer ' + (token ?? ""),
                },
            });

            if (!response.status) throw new Error(`HTTP error ${response.status}`);
            const body = await response.data;

            console.log(body);
            setSuggestions(body.suggestions);

            setStage("submitted");
        } finally {
            setSubmitting(false);
            setShowSubmit(false);
        }
    };

    const confirmLeave = () => {
        setShowExit(false);
        router.push('/(tabs)');
    };
    const stayHere = () => setShowExit(false);

    useEffect(() => {
        if (loading) {
            fetchReadingData();
        }
    }, [loading]);

    const fetchReadingData = async () => {
        try {
            const session = await fetchAuthSession();
            const token = session.tokens?.accessToken?.toString() || session.tokens?.idToken?.toString();

            const response = await axios.get(`${API_BASE}/generateReading`, {
                headers: {
                    Authorization: 'Bearer ' + (token ?? ""),
                },
            });

            if (!response.status) throw new Error(`HTTP error ${response.status}`);
            const body = await response.data;

            setData(body);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    const onSelect = (choice: string) => {
        setSelectedAnswer(true);
        setAnswers(prev => ({ ...prev, [qIndex]: choice }));
    };

    useFocusEffect(
        useCallback(() => {
            const sub = BackHandler.addEventListener("hardwareBackPress", () => {
                if (stage === "question") {
                    if (qIndex === 0) setStage("passage");
                    else setQIndex(qIndex - 1);
                    return true; // handled
                }
                if (stage === "passage") {
                    setShowExit(true);
                    return true; // handled
                }
                return false; // default behavior for other stages
            });
            return () => sub.remove();
        }, [stage, qIndex])
    );

    const onNext = () => {
        if (!data) return;
        if (stage === "passage") {
            setStage("question");
            setQIndex(0);
            return;
        }
        // stage === "question"
        if (qIndex < data.quiz.length - 1) {
            if (!selectedAnswer) {
                setAnswers(prev => ({ ...prev, [qIndex]: '' }));
            }
            setQIndex(qIndex + 1);
            setSelectedAnswer(false);
        } else {
            // last question → submit
            openSubmitModal();
            console.log(answers);
        }
    };

    const onBack = () => {
        if (stage === "question" && qIndex === 0) {
            setStage("passage");
            return;
        }
        if (stage === "question" && qIndex > 0) {
            setQIndex(qIndex - 1);
        }
        if (stage === "passage") {
            setShowExit(true);
        }
    };

    const reset = () => {
        setStage("passage");
        setQIndex(0);
        setAnswers({});
    };

    const isChoiceSelected = stage === "question" ? !!answers[qIndex] : true;
    const progressLabel =
        stage === "question" && data
            ? `Question ${qIndex + 1} of ${data.quiz.length}`
            : stage === "submitted"
                ? "Completed"
                : "Reading";

    // score when submitted
    const score =
        stage === "submitted" && data
            ? Object.entries(answers).reduce((acc, [i, val]) => (data.quiz[Number(i)].answer === val.charAt(0) ? acc + 1 : acc), 0)
            : 0;

    if (loading) {
        return (
            <TopNavLayout>
                <ThemedView style={[styles.center, { padding: 24 }]}>
                    <ActivityIndicator size="large" />
                    <ThemedText style={{ marginTop: 12 }}>Loading…</ThemedText>
                </ThemedView>
            </TopNavLayout>
        );
    }

    if (!data) {
        return (
            <TopNavLayout>
                <ThemedView style={[styles.center, { padding: 24 }]}>
                    <ThemedText>Failed to load content.</ThemedText>
                </ThemedView>
            </TopNavLayout>
        );
    }

    return (
        <TopNavLayout onBack={onBack} onNext={onNext} isChoiceSelected={isChoiceSelected} isSubmit={qIndex === data.quiz.length - 1} stage={stage}>
            <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle">{data.title}</ThemedText>
                <ThemedText style={styles.smallMuted}>{progressLabel}</ThemedText>
            </ThemedView>

            {stage === "passage" && (
                <ThemedView style={styles.card}>
                    <ThemedText style={styles.passage}>{data.passage}</ThemedText>
                </ThemedView>
            )}

            {stage === "question" && (
                <ThemedView style={styles.card}>
                    <ThemedText type="subtitle" style={{ marginBottom: 12, paddingBottom: 12 }}>
                        {data.quiz[qIndex].question}
                    </ThemedText>

                    <View style={{ gap: 8 }}>
                        {data.quiz[qIndex].options.map(opt => {
                            const selected = answers[qIndex] === opt;
                            return (
                                <TouchableOpacity key={opt} style={[styles.option, selected && styles.optionSelected]} onPress={() => onSelect(opt)}>
                                    <ThemedText type="default">{opt}</ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ThemedView>
            )}

            {stage === "submitted" && data && suggestions && (
                <ResultAndReview data={data} score={score} answers={answers} suggestions={suggestions} />
            )}

            <Modal
                visible={showExit}
                transparent
                animationType="fade"
                onRequestClose={stayHere} // Android back when modal open
            >
                <View style={styles.modalOverlay}>
                    <ThemedView style={styles.modalCard}>
                        <ThemedText type="subtitle">Leave this session?</ThemedText>
                        <ThemedText style={{ opacity: 0.8, marginTop: 6 }}>
                            Your progress will be lost.
                        </ThemedText>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={stayHere} style={[styles.mBtn, styles.mBtnSecondary]}>
                                <ThemedText>Stay</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmLeave} style={[styles.mBtn, styles.mBtnDanger]}>
                                <ThemedText>Leave</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </ThemedView>
                </View>
            </Modal>

            <ModalSubmitConfirm unansweredIdx={unansweredIdx} submitting={submitting} goToFirstUnanswered={goToFirstUnanswered} showSubmit={showSubmit} closeSubmitModal={closeSubmitModal} confirmSubmit={confirmSubmit} />

        </TopNavLayout>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        padding: 12,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
        borderTopRightRadius: "4rem"
    },
    largeMuted: { fontSize: 20 },
    smallMuted: { opacity: 0.7, fontSize: 14 },
    card: { padding: 12 },
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
});
