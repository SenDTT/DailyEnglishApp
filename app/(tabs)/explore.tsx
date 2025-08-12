// ResultListScreen.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import ScoreRing from "../../components/Common/ScoreRing";
import { useAuth } from "../context/AuthContext";

const API_BASE: string =
  (Constants.expoConfig?.extra as any)?.API_BASE ??
  (Constants.manifest2?.extra as any)?.API_BASE;

type ResultItem = {
  userId: string;
  date: string;
  title: string;
  clientScore: number;
  total: number;
  createdAt: string; // ISO
};

const ACTIONS_WIDTH = 60; // how far to swipe left to fully show the actions

export default function ResultListScreen({ navigation }: any) {
  const [items, setItems] = useState<ResultItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();

  const fetchPage = useCallback(
    async (next?: string | null, pageSize = 20) => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/getAllResults`, {
          params: { limit: pageSize, cursor: next ?? undefined },
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data as { items: ResultItem[]; cursor: string | null };
        setItems((prev) => (next ? [...prev, ...data.items] : data.items));
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

  const rowKey = (it: ResultItem) => it.userId + it.date;

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
          navigation.navigate("ResultDetail", { resultId: rowKey(it) });
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
    </ThemedView>
  );
}
