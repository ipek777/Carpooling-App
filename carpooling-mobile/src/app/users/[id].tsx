import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_BASE_URL } from '@/lib/config';
import { useAuth } from '@/lib/auth';

type PublicProfile = {
  id: number;
  name: string;
  email: string;
  photoUrl: string | null;
  createdAt: string;
  tripsDriven: number;
  tripsJoined: number;
  averageRating: number;
};

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login' as any);
      return;
    }

    const loadProfile = async () => {
      if (!token || !id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setError(data?.error || 'Unable to load this profile.');
          return;
        }

        setProfile(data);
      } catch {
        setError('Unable to load this profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, isAuthenticated, router, token]);

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <Text style={styles.status}>Redirecting to login...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backLink}>Back</Text>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {profile ? (
        <View style={styles.card}>
          {profile.photoUrl ? (
            <Image source={{ uri: profile.photoUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>

          <View style={styles.stats}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{profile.tripsDriven}</Text>
              <Text style={styles.statLabel}>Driven</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{profile.tripsJoined}</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {profile.averageRating ? profile.averageRating.toFixed(1) : 'New'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FF' },
  content: { padding: 20, paddingBottom: 100 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F6FF',
  },
  backLink: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 18,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 16,
    backgroundColor: '#DBEAFE',
  },
  avatarText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#2563EB',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  email: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  stats: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  status: { color: '#64748B' },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 16,
  },
});
