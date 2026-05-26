import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/config';

export default function CreateTripScreen() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [pricePerSeat, setPricePerSeat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrip = async () => {
    if (!isAuthenticated || !token) {
      router.replace('/login' as any);
      return;
    }

    setError(null);

    if (!origin.trim() || !destination.trim() || !date.trim() || !departureTime.trim()) {
      setError('Please fill in origin, destination, date, and departure time.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          origin: origin.trim(),
          destination: destination.trim(),
          date: date.trim(),
          departureTime: departureTime.trim(),
          capacity: Number(capacity),
          pricePerSeat: Number(pricePerSeat),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Unable to create trip.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      router.replace(`/trips/${data.id}` as any);
    } catch {
      setError('Unable to create trip. Please try again.');
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    router.replace('/login' as any);
    return (
      <View style={styles.centered}>
        <Text style={styles.status}>Redirecting to login...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Trip</Text>
      <Text style={styles.subtitle}>Publish an upcoming carpool for passengers to join.</Text>

      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>Origin</Text>
        <TextInput
          style={styles.input}
          value={origin}
          onChangeText={setOrigin}
          placeholder="Sofia"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Destination</Text>
        <TextInput
          style={styles.input}
          value={destination}
          onChangeText={setDestination}
          placeholder="Plovdiv"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>Departure time</Text>
        <TextInput
          style={styles.input}
          value={departureTime}
          onChangeText={setDepartureTime}
          placeholder="HH:mm"
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>Capacity</Text>
        <TextInput
          style={styles.input}
          value={capacity}
          onChangeText={setCapacity}
          placeholder="4"
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Price per seat</Text>
        <TextInput
          style={styles.input}
          value={pricePerSeat}
          onChangeText={setPricePerSeat}
          placeholder="12.50"
          keyboardType="decimal-pad"
        />

        <Pressable style={styles.createButton} onPress={createTrip} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.createButtonText}>Create Trip</Text>
          )}
        </Pressable>

        <Pressable style={styles.cancelButton} onPress={() => router.back()} disabled={loading}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  status: {
    color: '#555555',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
  },
  form: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#F8FAFF',
  },
  errorText: {
    color: '#B00020',
    fontWeight: '600',
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '700',
  },
});
