import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login' as any);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Redirecting to login…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip Details</Text>
      <Text style={styles.subtitle}>Trip ID: {id}</Text>
      <Text style={styles.note}>
        This screen will show the selected trip details when connected to the API.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 16,
  },
  note: {
    fontSize: 15,
    color: '#555555',
    textAlign: 'center',
    maxWidth: 320,
  },
});
