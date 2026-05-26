import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/config';

type Trip = {
  id: number;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  pricePerSeat: string;
  driverName: string;
  passengerCount: number;
  availableSeats: string[];
};

export default function TripsScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { token, isAuthenticated } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originQuery = searchParams.origin?.toString() || '';
  const destinationQuery = searchParams.destination?.toString() || '';
  const dateQuery = searchParams.date?.toString() || '';
  const availableQuery = searchParams.available?.toString() || '';
  const isSearchActive = Boolean(
    originQuery || destinationQuery || dateQuery || availableQuery
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login' as any);
      return;
    }

    const fetchTrips = async () => {
      if (!token) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let url = `${API_BASE_URL}/user/trips?page=${page}&limit=${pageSize}`;
        if (isSearchActive) {
          const query = new URLSearchParams();
          query.set('page', page.toString());
          query.set('limit', pageSize.toString());
          if (originQuery) query.set('origin', originQuery);
          if (destinationQuery) query.set('destination', destinationQuery);
          if (dateQuery) query.set('date', dateQuery);
          if (availableQuery) query.set('available', availableQuery);
          url = `${API_BASE_URL}/trips?${query.toString()}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setError(data?.error || 'Unable to load trips.');
          setTrips([]);
          return;
        }

        const data = await response.json();
        setTrips(data.trips || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError('Unable to load trips. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [isAuthenticated, token, page, pageSize, router, originQuery, destinationQuery, dateQuery, availableQuery, isSearchActive]);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.status}>Redirecting to login…</Text>
      </View>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSearchActive ? 'Available Trips' : 'My Upcoming Trips'}</Text>
      <Text style={styles.subheading}>
        {isSearchActive
          ? 'Filtered upcoming trips matching your search.'
          : 'Your upcoming trips.'}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#208AEF" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : trips.length === 0 ? (
        <Text style={styles.emptyText}>No active trips available.</Text>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/trips/${item.id}` as any)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {item.origin} → {item.destination}
                </Text>
                <Text style={styles.cardSubtitle}>{item.date}</Text>
              </View>
              <Text style={styles.cardDetails}>
                {item.departureTime} · {item.driverName}
              </Text>
              <Text style={styles.cardDetails}>
                {item.passengerCount} riders · ${item.pricePerSeat}
              </Text>
            </Pressable>
          )}
        />
      )}

      <View style={styles.pagination}>
        <Pressable
          style={[styles.pageButton, page === 1 && styles.disabledButton]}
          disabled={page === 1 || loading}
          onPress={() => setPage((current) => Math.max(1, current - 1))}
        >
          <Text style={styles.pageButtonText}>Previous</Text>
        </Pressable>
        <Text style={styles.pageInfo}>
          Page {page} of {totalPages}
        </Text>
        <Pressable
          style={[styles.pageButton, page >= totalPages && styles.disabledButton]}
          disabled={page >= totalPages || loading}
          onPress={() => setPage((current) => Math.min(totalPages, current + 1))}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 18,
  },
  loader: {
    marginTop: 24,
  },
  errorText: {
    color: '#B00020',
    textAlign: 'center',
    marginTop: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#555555',
    marginTop: 24,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 10,
  },
  cardDetails: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  pageButton: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  disabledButton: {
    opacity: 0.4,
  },
  pageButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  pageInfo: {
    fontSize: 14,
    color: '#374151',
  },
  status: {
    color: '#555555',
    textAlign: 'center',
  },
});
