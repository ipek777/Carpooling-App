import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [availableOnly, setAvailableOnly] = useState(true);

  const searchTrips = () => {
    const query = new URLSearchParams();
    if (origin.trim()) query.set('origin', origin.trim());
    if (destination.trim()) query.set('destination', destination.trim());
    if (date.trim()) query.set('date', date.trim());
    query.set('available', availableOnly ? '1' : '0');

    router.push(`/trips?${query.toString()}` as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to CarpoolGo</Text>
      <Text style={styles.subtitle}>
        Find and filter upcoming carpool trips from the homepage.
      </Text>

      <View style={styles.searchCard}>
        <TextInput
          style={styles.input}
          placeholder="Origin"
          value={origin}
          onChangeText={setOrigin}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Destination"
          value={destination}
          onChangeText={setDestination}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          keyboardType="numbers-and-punctuation"
        />
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Only show available trips</Text>
          <Switch
            value={availableOnly}
            onValueChange={setAvailableOnly}
            thumbColor={availableOnly ? '#ffffff' : '#ffffff'}
            trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
          />
        </View>
        <Pressable style={styles.searchButton} onPress={searchTrips}>
          <Text style={styles.searchButtonText}>Search trips</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => router.push(isAuthenticated ? ('/trips' as any) : ('/login' as any))}
      >
        <Text style={styles.buttonText}>
          {isAuthenticated ? 'Browse My Trips' : 'Go to Login'}
        </Text>
      </Pressable>
      {isAuthenticated ? (
        <Pressable style={[styles.button, styles.logoutButton]} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      ) : null}
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
    marginTop: 16,
  },
  logoutButton: {
    backgroundColor: '#555555',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchCard: {
    width: '100%',
    marginBottom: 24,
    padding: 18,
    backgroundColor: '#F8FAFF',
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterLabel: {
    color: '#334155',
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
