import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const goToFindTrips = () => {
    router.push('/search' as any);
  };

  const goToCreateTrip = () => {
    router.push(isAuthenticated ? ('/trips/new' as any) : ('/login' as any));
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to CarpoolGo</Text>
        <Text style={styles.subtitle}>
          Share rides with people heading your way. Save money, reduce your carbon footprint,
          and make new friends on the road.
        </Text>

        <View style={styles.actionGroup}>
          <Pressable style={styles.primaryButton} onPress={goToFindTrips}>
            <Text style={styles.primaryButtonText}>Find Trips</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={goToCreateTrip}>
            <Text style={styles.secondaryButtonText}>Create Trip</Text>
          </Pressable>
        </View>

        {!isAuthenticated ? (
          <Pressable style={styles.loginButton} onPress={() => router.push('/login' as any)}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 14,
  },
  subtitle: {
    maxWidth: 340,
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 32,
  },
  actionGroup: {
    width: '100%',
    gap: 14,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 17,
    fontWeight: '700',
  },
  loginButton: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  loginButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  logoutButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '700',
  },
});
