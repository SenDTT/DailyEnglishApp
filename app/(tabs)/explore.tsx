// ResultListScreen.tsx
import { SuggestionsPayload } from "@/components/Common/SuggestionView";
import ResultAndReview from "@/components/Reading/ResultAndReview";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { IQuizObject } from "../(reading)/reading";
import ScoreRing from "../../components/Common/ScoreRing";
import { useAuth } from "../context/AuthContext";

const API_BASE: string =
  (Constants.expoConfig?.extra as any)?.API_BASE ??
  (Constants.manifest2?.extra as any)?.API_BASE;

export type ResultItem = {
  userId: string;
  resultId: string;
  date: string;
  clientScore: number;
  total: number;
  createdAt: string; // ISO
  suggestions: SuggestionsPayload,
  passage: {
    title: string;
    passage: string;
    quiz: IQuizObject[];
  },
  answers: string[];
};

const ACTIONS_WIDTH = 60; // how far to swipe left to fully show the actions

export default function ResultListScreen() {
  const [items, setItems] = useState<ResultItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();
  const [openDetail, setOpenDetail] = useState<ResultItem | null>(null);

  const fetchPage = useCallback(
    async (next?: string | null, pageSize = 20) => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/getAllResults`, {
          params: { limit: pageSize, cursor: next ?? undefined },
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;

        const jsonData = data.items.map((item: any) => ({
          userId: item.userId,
          resultId: item.resultId,
          date: item.date,
          clientScore: item.clientScore,
          total: item.total,
          createdAt: item.createdAt,
          suggestions: JSON.parse(item.suggestions) as SuggestionsPayload,
          passage: JSON.parse(item.passage),
          answers: JSON.parse(item.answers),
        }));

        setItems((prev) => (next ? [...prev, ...jsonData] : jsonData));
        setCursor(data.cursor);
      } catch (e) {
        console.log("Fetch results error:", e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    setCursor(null);
    fetchPage(null);
  }, [fetchPage]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onEnd = useCallback(() => {
    if (!loading && cursor) fetchPage(cursor);
  }, [loading, cursor, fetchPage]);

  const rowKey = (it: ResultItem) => it.resultId;

  const FrontRow = ({ it }: { it: ResultItem }) => {
    const pct = Math.round((it.total ? it.clientScore / it.total : 0) * 100);
    return (
      <ThemedView
        style={{
          padding: 12,
          marginBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#eee",
          backgroundColor: "white",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <ScoreRing score={it.clientScore} total={it.total} size={40} strokeWidth={6} showText={false} />
          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle" style={{ fontSize: 18 }}>
              {it.date}
            </ThemedText>
            <ThemedText style={{ opacity: 0.6, marginTop: 2 }}>
              {it.clientScore} / {it.total} ({pct}%)
            </ThemedText>
          </View>
          {/* no arrow; swipe to reveal actions */}
        </View>
      </ThemedView>
    );
  };

  const HiddenRow = ({ it, close }: { it: ResultItem; close: () => void }) => (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingRight: 12,
        gap: 8,
        backgroundColor: Colors.light.tint,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
      }}
    >
      <TouchableOpacity
        onPress={() => {
          close();
          setOpenDetail(it);
        }}
        style={{
          paddingVertical: 7,
          paddingHorizontal: 7,
          borderRadius: 10,
          backgroundColor: "#f1f1f1",
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Ionicons color={Colors.light.tint} name="eye-outline" size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={{ flex: 1, padding: 0 }}>
      <SwipeListView
        data={items}
        keyExtractor={rowKey}
        renderItem={({ item }) => <FrontRow it={item} />}
        renderHiddenItem={({ item }, rowMap) => {
          const key = rowKey(item);
          const close = () => rowMap[key]?.closeRow?.();
          return <HiddenRow it={item} close={close} />;
        }}
        // Infinite scroll + refresh
        onEndReached={onEnd}
        onEndReachedThreshold={0.2}
        refreshing={refreshing}
        onRefresh={refresh}
        ListFooterComponent={
          loading ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        // Swipe behavior
        disableLeftSwipe={false}
        disableRightSwipe={true}
        rightOpenValue={-ACTIONS_WIDTH}
        stopRightSwipe={-ACTIONS_WIDTH}
        closeOnRowOpen
        closeOnRowBeginSwipe
        closeOnRowPress
        friction={12}
        tension={40}
      />

      <Modal
        visible={!!openDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setOpenDetail(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.grabber} />
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
            >
              {openDetail && (
                <ResultAndReview
                  title={`Result of ${openDetail.date}`}
                  data={{
                    quiz: openDetail.passage.quiz,
                    title: openDetail.passage.title,
                    passage: openDetail.passage.passage,
                    date: openDetail.date,
                    vocabulary: [],
                  }}
                  score={openDetail.clientScore}
                  answers={openDetail.answers}
                  suggestions={openDetail.suggestions}
                  isShowPassages={true}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}


const styles = StyleSheet.create({
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