import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { SuggestionsPayload } from '@/components/Common/SuggestionView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import ResultAndReview from '@/components/Reading/ResultAndReview';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { IQuizObject } from '../(reading)/reading';
import { useAuth } from '../context/AuthContext';

const API_BASE: string =
  (Constants.expoConfig?.extra as any)?.API_BASE ??
  (Constants.manifest2?.extra as any)?.API_BASE; // fallback for web/older

export interface ITodayResult {
  date: string;
  title: string;
  passage: string;
  vocabulary: string[];
  quiz: IQuizObject[];
  userResult: {
    answers: string[]; // user selected answers
    score: number;
  }
  suggestions: SuggestionsPayload; // JSON stringified
  hasResult: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todayResult, setTodayResult] = useState<ITodayResult | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (loading) {
      fetchTodayResult();
    }
  }, [loading]);

  const fetchTodayResult = async () => {
    console.log("Fetching today's result with token", token);
    try {
      const response = await axios.get(`${API_BASE}/getTodayQuizAndResult`, {
        headers: {
          Authorization: 'Bearer ' + (token ?? ""),
        },
      });

      if (!response.status) throw new Error(`HTTP error ${response.status}`);
      const body = await response.data;

      setTodayResult({
        date: body.date,
        title: body.title,
        passage: body.passage,
        vocabulary: JSON.parse(body.vocabulary || '[]'),
        quiz: JSON.parse(body.quiz || '[]') as IQuizObject[],
        userResult: {
          answers: JSON.parse(body.userResult.answers || '[]'),
          score: body.userResult.score,
        },
        suggestions: JSON.parse(body.suggestions || {}),
        hasResult: body.hasResult,
      } as ITodayResult);
      setHasResult(body.hasResult);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  const handleStartQuiz = () => {
    router.push("/reading");
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/dailyenglishlogo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome Back!</ThemedText>
      </ThemedView>

      {/* Friendly intro message */}
      <ThemedText type="subtitle" style={styles.subtitle}>
        {hasResult
          ? "Great job showing up today! Check your progress below."
          : "Ready to boost your English today? Let’s get started!"}
      </ThemedText>

      {loading && (
        <ThemedView style={[styles.center, { padding: 24 }]}>
          <ActivityIndicator size="large" />
          <ThemedText style={{ marginTop: 12 }}>Loading…</ThemedText>
        </ThemedView>
      )}

      {/* Action button */}
      {!loading && !hasResult && (
        <Pressable
          onPress={handleStartQuiz}
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <ThemedText style={styles.buttonText}>Start Today's Quiz</ThemedText>
        </Pressable>
      )}

      {/* View today result */}
      {!loading && hasResult && todayResult && (
        <ResultAndReview
          title="Today's Result"
          data={{
            quiz: todayResult.quiz,
            title: todayResult.title,
            passage: todayResult.passage,
            date: todayResult.date,
            vocabulary: todayResult.vocabulary,
          }}
          score={todayResult.userResult.score}
          answers={todayResult.userResult.answers}
          suggestions={todayResult.suggestions}
          isShowPassages={true}
        />
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center'
  },
  center: { alignItems: "center", justifyContent: "center" },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    opacity: 0.8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  primaryBtn: { backgroundColor: '#111827', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
