import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/config';

type SeatPosition = 'front' | 'back_left' | 'back_middle' | 'back_right';

type TripDetails = {
  id: number;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  pricePerSeat: string;
  capacity: number;
  canceled: boolean;
  driverId: number;
  driverName: string;
  driverEmail: string;
  passengers: Array<{
    id: number;
    name: string;
    email: string;
    seatPosition: SeatPosition;
  }>;
  comments: Array<{
    id: number;
    userId: number;
    userName: string;
    text: string;
    commentDate: string;
  }>;
  reviews: Array<{
    id: number;
    reviewerId: number;
    reviewerName: string;
    rating: number;
    text: string | null;
    reviewDate: string;
  }>;
  averageRating: number;
  availableSeats?: SeatPosition[];
  state: 'upcoming' | 'past';
  isCanceled: boolean;
  isFullCapacity: boolean;
  isActive: boolean;
  isDriver: boolean;
  isPassenger: boolean;
};

const seatLabels: Record<SeatPosition, string> = {
  front: 'Front',
  back_left: 'Back left',
  back_middle: 'Back middle',
  back_right: 'Back right',
};

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [confirmLeaveVisible, setConfirmLeaveVisible] = useState(false);
  const [confirmCancelVisible, setConfirmCancelVisible] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<SeatPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadTrip = async () => {
    if (!id || !token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Unable to load trip details.');
        setTrip(null);
        return;
      }

      const data = await response.json();
      setTrip(data);
    } catch (err) {
      setError('Unable to load trip details.');
      setTrip(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login' as any);
      return;
    }

    if (!id) {
      setError('Invalid trip id.');
      return;
    }

    loadTrip();
  }, [id, isAuthenticated, router, token]);

  const handleJoin = async () => {
    if (!id || !token || !selectedSeat || !trip) {
      setModalError('Choose a seat first.');
      return;
    }

    setActionLoading(true);
    setModalError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/trips/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ seatPosition: selectedSeat }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setModalError(data?.error || 'Unable to join this trip.');
        return;
      }

      setJoinModalVisible(false);
      setSelectedSeat(null);
      setSuccessMessage(data?.message || 'You joined the trip.');
      await loadTrip();
    } catch (err) {
      setModalError('Unable to join this trip.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = () => {
    if (!trip) {
      return;
    }
    setConfirmLeaveVisible(true);
  };

  const confirmLeave = async () => {
    if (!id || !token) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/trips/${id}/leave`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || 'Unable to leave this trip.');
        return;
      }
      setSuccessMessage(data?.message || 'You left the trip.');
      setConfirmLeaveVisible(false);
      await loadTrip();
    } catch (err) {
      setError('Unable to leave this trip.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    if (!trip) {
      return;
    }
    setConfirmCancelVisible(true);
  };

  const confirmCancel = async () => {
    if (!id || !token) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/trips/${id}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || 'Unable to cancel this trip.');
        return;
      }
      setSuccessMessage(data?.message || 'Trip canceled successfully.');
      setConfirmCancelVisible(false);
      await loadTrip();
    } catch (err) {
      setError('Unable to cancel this trip.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.status}>Redirecting to login…</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Trip Details</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Trip Details</Text>
        <Text style={styles.subtitle}>No details available.</Text>
      </View>
    );
  }

  const active = trip.state === 'upcoming' && !trip.isCanceled;
  const availableSeats = trip.availableSeats || [];
  const openProfile = (userId: number) => {
    router.push(`/users/${userId}` as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Trip Details</Text>
      <View style={styles.badgeRow}>
        <Text style={styles.route}>{trip.origin} → {trip.destination}</Text>
        <View style={[
          styles.badge,
          trip.isCanceled ? styles.badgeCanceled : trip.state === 'upcoming' ? styles.badgeUpcoming : styles.badgePast,
        ]}>
          <Text style={styles.badgeText}>
            {trip.isCanceled ? 'Canceled' : trip.state === 'upcoming' ? 'Upcoming' : 'Past'}
          </Text>
        </View>
      </View>
      <Text style={styles.subtitle}>{trip.date} · {trip.departureTime}</Text>

      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      {active ? (
        <View style={styles.actionsRow}>
          {trip.isDriver ? (
            <Pressable
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
              disabled={actionLoading}
            >
              <Text style={styles.actionButtonText}>{actionLoading ? 'Canceling…' : 'Cancel Trip'}</Text>
            </Pressable>
          ) : trip.isPassenger ? (
            <Pressable
              style={[styles.actionButton, styles.leaveButton]}
              onPress={handleLeave}
              disabled={actionLoading}
            >
              <Text style={styles.actionButtonText}>{actionLoading ? 'Leaving…' : 'Leave Trip'}</Text>
            </Pressable>
          ) : availableSeats.length > 0 ? (
            <Pressable
              style={[styles.actionButton, styles.joinButton]}
              onPress={() => {
                setModalError(null);
                setSelectedSeat(availableSeats[0] || null);
                setJoinModalVisible(true);
              }}
              disabled={actionLoading}
            >
              <Text style={styles.actionButtonText}>Join Trip</Text>
            </Pressable>
          ) : (
            <Text style={styles.sectionNote}>No seats available to join.</Text>
          )}
        </View>
      ) : null}

      <View style={styles.summaryCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Driver</Text>
          <Text style={[styles.value, styles.linkText]} onPress={() => openProfile(trip.driverId)}>
            {trip.driverName}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{trip.driverEmail}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Price</Text>
          <Text style={styles.value}>${trip.pricePerSeat}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Capacity</Text>
          <Text style={styles.value}>{trip.capacity}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Joined</Text>
          <Text style={styles.value}>{trip.passengers.length}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Available</Text>
          <Text style={styles.value}>{availableSeats.length}</Text>
        </View>
      </View>

      <View style={[styles.section, styles.sectionCard]}>
        <Text style={styles.sectionTitle}>Passengers</Text>
        {trip.passengers.length === 0 ? (
          <Text style={styles.sectionNote}>No passengers yet.</Text>
        ) : (
          trip.passengers.map((passenger) => (
            <View key={passenger.id} style={styles.listItem}>
              <Text style={[styles.itemTitle, styles.linkText]} onPress={() => openProfile(passenger.id)}>
                {passenger.name}
              </Text>
              <Text style={styles.itemSubtitle}>{seatLabels[passenger.seatPosition]}</Text>
            </View>
          ))
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {trip.reviews.length === 0 ? (
          <Text style={styles.sectionNote}>No reviews yet.</Text>
        ) : (
          trip.reviews.map((review) => (
            <View key={review.id} style={styles.listItem}>
              <Text style={styles.itemTitle}>
                <Text style={styles.linkText} onPress={() => openProfile(review.reviewerId)}>
                  {review.reviewerName}
                </Text>
                {' '}· {review.rating}★
              </Text>
              <Text style={styles.itemSubtitle}>{review.text || 'No comment.'}</Text>
            </View>
          ))
        )}
      </View>
      <View style={[styles.section, styles.sectionCard]}> 
        <Text style={styles.sectionTitle}>Comments</Text>
        {trip.comments.length === 0 ? (
          <Text style={styles.sectionNote}>No comments yet.</Text>
        ) : (
          trip.comments.map((comment) => (
            <View key={comment.id} style={styles.listItem}>
              <Text style={[styles.itemTitle, styles.linkText]} onPress={() => openProfile(comment.userId)}>
                {comment.userName}
              </Text>
              <Text style={styles.itemSubtitle}>{comment.text}</Text>
            </View>
          ))
        )}
      </View>

      <Modal visible={joinModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose your seat</Text>
            {modalError ? <Text style={styles.errorText}>{modalError}</Text> : null}
            {availableSeats.length === 0 ? (
              <Text style={styles.sectionNote}>No seats are currently available.</Text>
            ) : (
              availableSeats.map((seat) => {
                const selected = seat === selectedSeat;
                return (
                  <Pressable
                    key={seat}
                    style={[styles.seatOption, selected && styles.seatOptionSelected]}
                    onPress={() => {
                      setSelectedSeat(seat);
                      setModalError(null);
                    }}
                  >
                    <Text style={[styles.seatOptionText, selected && styles.seatOptionTextSelected]}>
                      {seatLabels[seat]}
                    </Text>
                  </Pressable>
                );
              })
            )}
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalAction, styles.secondaryButton]}
                onPress={() => {
                  setJoinModalVisible(false);
                  setSelectedSeat(null);
                  setModalError(null);
                }}
              >
                <Text style={styles.modalActionText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalAction, styles.primaryButton, (!selectedSeat || actionLoading) && styles.disabledButton]}
                onPress={handleJoin}
                disabled={!selectedSeat || actionLoading}
              >
                <Text style={styles.modalActionText}>{actionLoading ? 'Joining…' : 'Join'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmLeaveVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Leave trip?</Text>
            <Text style={styles.sectionNote}>Are you sure you want to leave this trip?</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalAction, styles.secondaryButton]}
                onPress={() => setConfirmLeaveVisible(false)}
              >
                <Text style={[styles.modalActionText, styles.modalActionTextSecondary]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalAction, styles.primaryButton, actionLoading && styles.disabledButton]}
                onPress={confirmLeave}
                disabled={actionLoading}
              >
                <Text style={styles.modalActionText}>{actionLoading ? 'Leaving…' : 'Leave'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmCancelVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel trip?</Text>
            <Text style={styles.sectionNote}>Are you sure you want to cancel this trip? All passengers will be removed.</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalAction, styles.secondaryButton]}
                onPress={() => setConfirmCancelVisible(false)}
              >
                <Text style={[styles.modalActionText, styles.modalActionTextSecondary]}>No</Text>
              </Pressable>
              <Pressable
                style={[styles.modalAction, styles.primaryButton, actionLoading && styles.disabledButton]}
                onPress={confirmCancel}
                disabled={actionLoading}
              >
                <Text style={styles.modalActionText}>{actionLoading ? 'Canceling…' : 'Cancel Trip'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FF',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
    color: '#1D2939',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  route: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeUpcoming: {
    backgroundColor: '#DCFCE7',
  },
  badgePast: {
    backgroundColor: '#E2E8F0',
  },
  badgeCanceled: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 5,
    marginBottom: 22,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
  },
  value: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  linkText: {
    color: '#2563EB',
  },
  section: {
    marginTop: 24,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    color: '#0F172A',
  },
  sectionNote: {
    color: '#64748B',
    fontSize: 14,
  },
  listItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  status: {
    color: '#475569',
    textAlign: 'center',
  },
  successText: {
    color: '#0F766E',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 18,
  },
  actionButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  joinButton: {
    backgroundColor: '#10B981',
  },
  leaveButton: {
    backgroundColor: '#F97316',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  seatOption: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  seatOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  seatOptionText: {
    fontSize: 16,
    color: '#0F172A',
  },
  seatOptionTextSelected: {
    fontWeight: '700',
    color: '#1D4ED8',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  modalAction: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  secondaryButton: {
    backgroundColor: '#E2E8F0',
  },
  modalActionText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  modalActionTextSecondary: {
    color: '#0F172A',
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
    marginTop: 12,
  },
});
