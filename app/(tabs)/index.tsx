import { Image } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fetchAuthSession } from "aws-amplify/auth";
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

const API_BASE: string =
  (Constants.expoConfig?.extra as any)?.API_BASE ??
  (Constants.manifest2?.extra as any)?.API_BASE; // fallback for web/older

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todayResult, setTodayResult] = useState(null);
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    if (loading) {
      fetchTodayResult();
    }
  }, [loading]);

  const fetchTodayResult = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString() || session.tokens?.idToken?.toString();

      const response = await axios.get(`${API_BASE}/getTodayQuizAndResult`, {
        headers: {
          Authorization: 'Bearer ' + (token ?? ""),
        },
      });

      if (!response.status) throw new Error(`HTTP error ${response.status}`);
      const body = await response.data;

      setTodayResult(body);
      setHasResult(body.hasResult);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  const handleStartQuiz = () => {
    router.push("/(reading)");
  };

  const handleSeeResult = () => {
    router.push("/(result)");
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
        <HelloWave />
      </ThemedView>

      {/* Friendly intro message */}
      <ThemedText type="subtitle" style={styles.subtitle}>
        {hasResult
          ? "Great job showing up today! 🎯 Check your progress below."
          : "Ready to boost your English today? Let’s get started! 🚀"}
      </ThemedText>

      {/* Action button */}
      {!loading && (
        <Pressable
          onPress={hasResult ? handleSeeResult : handleStartQuiz}
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <ThemedText style={styles.buttonText}>
            {hasResult ? "See Today's Result" : "Start Today's Quiz"}
          </ThemedText>
        </Pressable>
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
