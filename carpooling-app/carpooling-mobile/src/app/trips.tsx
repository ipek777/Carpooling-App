import { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function TripsScreen() {
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
      <Text style={styles.title}>Trips</Text>
      <Text style={styles.subtitle}>
        Browse upcoming trips and see who is joining.
      </Text>
      <Pressable style={styles.button} onPress={() => router.push('/trips/1' as any)}>
        <Text style={styles.buttonText}>Open Trip Details</Text>
      </Pressable>
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
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#208AEF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
