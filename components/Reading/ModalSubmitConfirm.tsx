import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

export default function ModalSubmitConfirm({
    showSubmit,
    closeSubmitModal,
    confirmSubmit,
    unansweredIdx,
    goToFirstUnanswered,
    submitting
}: {
    showSubmit: boolean;
    closeSubmitModal: () => void;
    confirmSubmit: () => void;
    unansweredIdx: number[];
    goToFirstUnanswered: () => void;
    submitting: boolean;
}) {
    return (
        <Modal
            visible={showSubmit}
            transparent
            animationType="fade"
            onRequestClose={closeSubmitModal}
        >
            <View style={styles.modalOverlay}>
                <ThemedView style={styles.modalCard}>
                    <ThemedText type="subtitle">Submit answers?</ThemedText>

                    {unansweredIdx.length > 0 ? (
                        <>
                            <ThemedText style={{ opacity: 0.8, marginTop: 6 }}>
                                You have {unansweredIdx.length} unanswered {unansweredIdx.length === 1 ? "question" : "questions"}:
                            </ThemedText>
                            <ThemedText style={{ marginTop: 4 }}>
                                {unansweredIdx.map(i => i + 1).join(", ")}
                            </ThemedText>
                        </>
                    ) : (
                        <ThemedText style={{ opacity: 0.8, marginTop: 6 }}>
                            All questions are answered. Ready to submit?
                        </ThemedText>
                    )}

                    <View style={styles.modalActions}>
                        {unansweredIdx.length > 0 && (
                            <TouchableOpacity onPress={goToFirstUnanswered} style={[styles.mBtn, styles.mBtnSecondary]}>
                                <ThemedText>Review</ThemedText>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={closeSubmitModal} style={[styles.mBtn, styles.mBtnSecondary]}>
                            <ThemedText>Cancel</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={confirmSubmit}
                            disabled={submitting}
                            style={[styles.mBtn, styles.mBtnDanger, submitting && { opacity: 0.6 }]}
                        >
                            <ThemedText>{submitting ? "Submitting..." : "Submit"}</ThemedText>
                        </TouchableOpacity>
                    </View>
                </ThemedView>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
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
