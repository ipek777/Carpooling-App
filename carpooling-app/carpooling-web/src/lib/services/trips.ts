"use server";

import { eq, and, sql, desc, ne, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { trips, tripBookings, users, tripComments, tripReviews } from "@/db/drizzle.schema";

export interface TripWithPassengers {
  id: number;
  driverId: number;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  pricePerSeat: string;
  capacity: number;
  canceled: boolean;
  createdAt: Date;
  updatedAt: Date;
  driverName: string;
  driverEmail: string;
  passengers: Array<{
    id: number;
    name: string;
    email: string;
    seatPosition: "front" | "back_left" | "back_middle" | "back_right";
  }>;
  comments?: Array<{
    id: number;
    userId: number;
    userName: string;
    text: string;
    commentDate: Date;
  }>;
  reviews?: Array<{
    id: number;
    reviewerId: number;
    reviewerName: string;
    rating: number;
    text: string | null;
    reviewDate: Date;
  }>;
  averageRating: number;
  availableSeats?: Array<"front" | "back_left" | "back_middle" | "back_right">;
  state: "upcoming" | "past";
  isCanceled: boolean;
  isFullCapacity: boolean;
  isActive: boolean;
}

function getTripState(date: string, departureTime: string): "upcoming" | "past" {
  const now = new Date();
  const tripDateTime = new Date(`${date}T${departureTime}`);
  return tripDateTime > now ? "upcoming" : "past";
}

function isTripsFullCapacity(capacity: number, passengerCount: number): boolean {
  return passengerCount >= capacity;
}

/**
 * Get all trips for a user (both as driver and as passenger)
 * Organized by upcoming and past trips
 */
export async function getUserTrips(userId: number) {
  // Get trips where user is the driver
  const drivingTrips = await db
    .select({
      trip: trips,
      driverName: users.name,
      driverEmail: users.email,
    })
    .from(trips)
    .leftJoin(users, eq(trips.driverId, users.id))
    .where(eq(trips.driverId, userId));

  // Get trips where user is a passenger
  const passengerTrips = await db
    .select({
      trip: trips,
      driverName: users.name,
      driverEmail: users.email,
    })
    .from(tripBookings)
    .leftJoin(trips, eq(tripBookings.tripId, trips.id))
    .leftJoin(users, eq(trips.driverId, users.id))
    .where(
      and(
        eq(tripBookings.passengerId, userId),
        ne(tripBookings.status, "canceled")
      )
    );

  // Combine and deduplicate trips
  const tripMap = new Map<number, typeof drivingTrips[0]>();

  drivingTrips.forEach((item) => {
    tripMap.set(item.trip.id, item);
  });

  passengerTrips.forEach((item) => {
    if (item.trip) {
        const { trip, ...rest } = item;
      tripMap.set(item.trip.id, { ...rest, trip });
    }
  });

  const allTripsData = Array.from(tripMap.values());

  // Fetch passengers for each trip
  const tripsWithPassengers: TripWithPassengers[] = await Promise.all(
    allTripsData.map(async (tripData) => {
      const tripId = tripData.trip.id;

      const bookings = await db
        .select({
          passengerId: tripBookings.passengerId,
          passengerName: users.name,
          passengerEmail: users.email,
          seatPosition: tripBookings.seatPosition,
        })
        .from(tripBookings)
        .leftJoin(users, eq(tripBookings.passengerId, users.id))
        .where(
          and(
            eq(tripBookings.tripId, tripId),
            ne(tripBookings.status, "canceled")
          )
        );

      const reviewRows = await db
        .select({ rating: tripReviews.rating })
        .from(tripReviews)
        .where(eq(tripReviews.tripId, tripId));

      const averageRating = reviewRows.length > 0
        ? Math.round((reviewRows.reduce((sum, review) => sum + review.rating, 0) / reviewRows.length) * 10) / 10
        : 0;

      const state = getTripState(tripData.trip.date, tripData.trip.departureTime);
      const isFullCapacity = isTripsFullCapacity(
        tripData.trip.capacity,
        bookings.length
      );
      const isActive =
        state === "upcoming" && !tripData.trip.canceled;

      return {
        ...tripData.trip,
        driverName: tripData.driverName || "",
        driverEmail: tripData.driverEmail || "",
        passengers: bookings.map((b) => ({
          id: b.passengerId,
          name: b.passengerName || "",
          email: b.passengerEmail || "",
          seatPosition: b.seatPosition as "front" | "back_left" | "back_middle" | "back_right",
        })),
        comments: [],
        reviews: [],
        averageRating,
        availableSeats: await getAvailableSeats(tripId),
        state,
        isCanceled: tripData.trip.canceled,
        isFullCapacity,
        isActive,
      };
    })
  );

  // Separate into upcoming and past trips
  const upcomingTrips = tripsWithPassengers
    .filter((t) => t.state === "upcoming")
    .sort(
      (a, b) =>
        new Date(`${b.date}T${b.departureTime}`).getTime() -
        new Date(`${a.date}T${a.departureTime}`).getTime()
    );

  const pastTrips = tripsWithPassengers
    .filter((t) => t.state === "past" || t.isCanceled)
    .sort(
      (a, b) =>
        new Date(`${b.date}T${b.departureTime}`).getTime() -
        new Date(`${a.date}T${a.departureTime}`).getTime()
    );

  return {
    upcomingTrips,
    pastTrips,
  };
}

/**
 * Get a single trip with passengers by ID
 */
export async function getTripById(tripId: number) {
  const tripData = await db
    .select({
      trip: trips,
      driverName: users.name,
      driverEmail: users.email,
    })
    .from(trips)
    .leftJoin(users, eq(trips.driverId, users.id))
    .where(eq(trips.id, tripId));

  if (tripData.length === 0) return null;

  const trip = tripData[0];

  const bookings = await db
    .select({
      passengerId: tripBookings.passengerId,
      passengerName: users.name,
      passengerEmail: users.email,
      seatPosition: tripBookings.seatPosition,
    })
    .from(tripBookings)
    .leftJoin(users, eq(tripBookings.passengerId, users.id))
    .where(
      and(
        eq(tripBookings.tripId, tripId),
        ne(tripBookings.status, "canceled")
      )
    );

  const comments = await db
    .select({
      id: tripComments.id,
      userId: tripComments.userId,
      userName: users.name,
      text: tripComments.text,
      commentDate: tripComments.commentDate,
    })
    .from(tripComments)
    .leftJoin(users, eq(tripComments.userId, users.id))
    .where(eq(tripComments.tripId, tripId))
    .orderBy(desc(tripComments.commentDate));

  const reviews = await db
    .select({
      id: tripReviews.id,
      reviewerId: tripReviews.reviewerId,
      reviewerName: users.name,
      rating: tripReviews.rating,
      text: tripReviews.text,
      reviewDate: tripReviews.reviewDate,
    })
    .from(tripReviews)
    .leftJoin(users, eq(tripReviews.reviewerId, users.id))
    .where(eq(tripReviews.tripId, tripId))
    .orderBy(desc(tripReviews.reviewDate));

  const state = getTripState(trip.trip.date, trip.trip.departureTime);
  const isFullCapacity = isTripsFullCapacity(trip.trip.capacity, bookings.length);
  const isActive = state === "upcoming" && !trip.trip.canceled;

  return {
    ...trip.trip,
    driverName: trip.driverName || "",
    driverEmail: trip.driverEmail || "",
    passengers: bookings.map((b) => ({
      id: b.passengerId,
      name: b.passengerName || "",
      email: b.passengerEmail || "",
      seatPosition: b.seatPosition as "front" | "back_left" | "back_middle" | "back_right",
    })),
    comments: comments.map((c) => ({
      id: c.id,
      userId: c.userId,
      userName: c.userName || "",
      text: c.text,
      commentDate: c.commentDate,
    })),
    reviews: reviews.map((r) => ({
      id: r.id,
      reviewerId: r.reviewerId,
      reviewerName: r.reviewerName || "",
      rating: r.rating,
      text: r.text,
      reviewDate: r.reviewDate,
    })),
    state,
    isCanceled: trip.trip.canceled,
    isFullCapacity,
    isActive,
    availableSeats: await getAvailableSeats(tripId),
  };
}

/**
 * Get available seats for a trip
 */
export async function getAvailableSeats(tripId: number): Promise<Array<"front" | "back_left" | "back_middle" | "back_right">> {
  const allSeats: Array<"front" | "back_left" | "back_middle" | "back_right"> = [
    "front",
    "back_left",
    "back_middle",
    "back_right",
  ];

  const bookedSeats = await db
    .select({ seatPosition: tripBookings.seatPosition })
    .from(tripBookings)
    .where(
      and(
        eq(tripBookings.tripId, tripId),
        ne(tripBookings.status, "canceled")
      )
    );

  const bookedSeatSet = new Set(bookedSeats.map((b) => b.seatPosition));
  return allSeats.filter((seat) => !bookedSeatSet.has(seat)) as Array<"front" | "back_left" | "back_middle" | "back_right">;
}

/**
 * Check if a user is currently a passenger on a trip
 */
export async function isUserPassenger(tripId: number, userId: number): Promise<boolean> {
  const booking = await db
    .select({ id: tripBookings.id })
    .from(tripBookings)
    .where(
      and(
        eq(tripBookings.tripId, tripId),
        eq(tripBookings.passengerId, userId),
        ne(tripBookings.status, "canceled")
      )
    )
    .limit(1);

  return booking.length > 0;
}

export async function isUserConfirmedPassenger(tripId: number, userId: number): Promise<boolean> {
  const booking = await db
    .select({ id: tripBookings.id })
    .from(tripBookings)
    .where(
      and(
        eq(tripBookings.tripId, tripId),
        eq(tripBookings.passengerId, userId),
        eq(tripBookings.status, "confirmed")
      )
    )
    .limit(1);

  return booking.length > 0;
}

export async function addTripComment(
  tripId: number,
  userId: number,
  text: string
): Promise<{ success: boolean; message: string; commentId?: number }> {
  try {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return { success: false, message: "Comment cannot be empty" };
    }

    if (trimmedText.length > 1000) {
      return { success: false, message: "Comment must be 1000 characters or less" };
    }

    const tripData = await db
      .select({
        id: trips.id,
        driverId: trips.driverId,
      })
      .from(trips)
      .where(eq(trips.id, tripId))
      .limit(1);

    if (tripData.length === 0) {
      return { success: false, message: "Trip not found" };
    }

    const trip = tripData[0];
    const isDriver = trip.driverId === userId;
    const isPassenger = await isUserPassenger(tripId, userId);

    if (!isDriver && !isPassenger) {
      return { success: false, message: "Only the driver and passengers can comment on this trip" };
    }

    const [comment] = await db
      .insert(tripComments)
      .values({
        tripId,
        userId,
        text: trimmedText,
      })
      .returning({ id: tripComments.id });

    return { success: true, message: "Comment added", commentId: comment.id };
  } catch (error) {
    console.error("Error adding trip comment:", error);
    return { success: false, message: "An error occurred while adding the comment" };
  }
}

export async function addTripReview(
  tripId: number,
  reviewerId: number,
  rating: number,
  text: string | null
): Promise<{ success: boolean; message: string; reviewId?: number }> {
  try {
    const reviewText = text?.trim() || null;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { success: false, message: "Rating must be between 1 and 5" };
    }

    if (reviewText && reviewText.length > 1000) {
      return { success: false, message: "Review text must be 1000 characters or less" };
    }

    const tripData = await db
      .select({
        id: trips.id,
        date: trips.date,
        departureTime: trips.departureTime,
      })
      .from(trips)
      .where(eq(trips.id, tripId))
      .limit(1);

    if (tripData.length === 0) {
      return { success: false, message: "Trip not found" };
    }

    const trip = tripData[0];
    if (getTripState(trip.date, trip.departureTime) !== "past") {
      return { success: false, message: "Reviews can only be added to past trips" };
    }

    const isPassenger = await isUserConfirmedPassenger(tripId, reviewerId);
    if (!isPassenger) {
      return { success: false, message: "Only passengers can review this trip" };
    }

    const existingReview = await db
      .select({ id: tripReviews.id })
      .from(tripReviews)
      .where(
        and(
          eq(tripReviews.tripId, tripId),
          eq(tripReviews.reviewerId, reviewerId)
        )
      )
      .limit(1);

    if (existingReview.length > 0) {
      return { success: false, message: "You have already reviewed this trip" };
    }

    const [review] = await db
      .insert(tripReviews)
      .values({
        tripId,
        reviewerId,
        rating,
        text: reviewText,
      })
      .onConflictDoNothing({
        target: [tripReviews.tripId, tripReviews.reviewerId],
      })
      .returning({ id: tripReviews.id });

    if (!review) {
      return { success: false, message: "You have already reviewed this trip" };
    }

    return { success: true, message: "Review added", reviewId: review.id };
  } catch (error) {
    console.error("Error adding trip review:", error);
    return { success: false, message: "An error occurred while adding the review" };
  }
}

/**
 * Join a trip by creating a booking
 */
export async function joinTrip(
  tripId: number,
  userId: number,
  seatPosition: "front" | "back_left" | "back_middle" | "back_right"
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify trip exists and is upcoming
    const tripData = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .limit(1);

    if (tripData.length === 0) {
      return { success: false, message: "Trip not found" };
    }

    const trip = tripData[0];
    const state = getTripState(trip.date, trip.departureTime);

    if (state !== "upcoming" || trip.canceled) {
      return { success: false, message: "This trip is not available for joining" };
    }

    // Check if user is already a passenger
    const isPassenger = await isUserPassenger(tripId, userId);
    if (isPassenger) {
      return { success: false, message: "You are already a passenger on this trip" };
    }

    // Check if seat is available
    const availableSeats = await getAvailableSeats(tripId);
    if (!availableSeats.includes(seatPosition)) {
      return { success: false, message: "This seat is no longer available" };
    }

    // Create booking
    await db.insert(tripBookings).values({
      tripId,
      passengerId: userId,
      seatPosition,
      status: "confirmed",
    });

    return { success: true, message: "Successfully joined the trip!" };
  } catch (error) {
    console.error("Error joining trip:", error);
    return { success: false, message: "An error occurred while joining the trip" };
  }
}

/**
 * Leave a trip by canceling the booking
 */
export async function leaveTrip(tripId: number, userId: number): Promise<{ success: boolean; message: string }> {
  try {
    // Verify trip exists and is upcoming
    const tripData = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .limit(1);

    if (tripData.length === 0) {
      return { success: false, message: "Trip not found" };
    }

    const trip = tripData[0];
    const state = getTripState(trip.date, trip.departureTime);

    if (state !== "upcoming") {
      return { success: false, message: "Cannot leave a trip that has already started" };
    }

    // Check if user is a passenger
    const isPassenger = await isUserPassenger(tripId, userId);
    if (!isPassenger) {
      return { success: false, message: "You are not a passenger on this trip" };
    }

    // Mark booking as canceled
    await db
      .update(tripBookings)
      .set({ status: "canceled" })
      .where(
        and(
          eq(tripBookings.tripId, tripId),
          eq(tripBookings.passengerId, userId),
          ne(tripBookings.status, "canceled")
        )
      );

    return { success: true, message: "You have left the trip" };
  } catch (error) {
    console.error("Error leaving trip:", error);
    return { success: false, message: "An error occurred while leaving the trip" };
  }
}

export interface OpenTripSummary {
  id: number;
  driverId: number;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  pricePerSeat: string;
  capacity: number;
  canceled: boolean;
  driverName: string;
  driverEmail: string;
  passengerCount: number;
  availableSeats: Array<"front" | "back_left" | "back_middle" | "back_right">;
  state: "upcoming" | "past";
  isCanceled: boolean;
  isFullCapacity: boolean;
  isActive: boolean;
}

export interface OpenTripSearchOptions {
  origin?: string;
  destination?: string;
  date?: string;
  availableOnly?: boolean;
}

export interface CreateTripInput {
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  capacity: number;
  pricePerSeat: string;
}

export async function createTrip(driverId: number, input: CreateTripInput): Promise<number> {
  const [trip] = await db
    .insert(trips)
    .values({
      driverId,
      origin: input.origin,
      destination: input.destination,
      date: input.date,
      departureTime: input.departureTime,
      capacity: input.capacity,
      pricePerSeat: input.pricePerSeat,
    })
    .returning({ id: trips.id });

  return trip.id;
}

export async function updateTripDepartureTime(
  tripId: number,
  driverId: number,
  departureTime: string
): Promise<{ success: boolean; message: string }> {
  try {
    const tripData = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .limit(1);

    if (tripData.length === 0) {
      return { success: false, message: "Trip not found" };
    }

    const trip = tripData[0];
    if (trip.driverId !== driverId) {
      return { success: false, message: "Only the driver can edit this trip" };
    }

    if (trip.canceled) {
      return { success: false, message: "Cannot edit a canceled trip" };
    }

    const currentState = getTripState(trip.date, trip.departureTime);
    if (currentState !== "upcoming") {
      return { success: false, message: "Cannot edit a trip that has already started" };
    }

    const nextDepartureDateTime = new Date(`${trip.date}T${departureTime}`);
    if (Number.isNaN(nextDepartureDateTime.getTime()) || nextDepartureDateTime <= new Date()) {
      return { success: false, message: "Departure time must keep the trip in the future" };
    }

    await db
      .update(trips)
      .set({
        departureTime,
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId));

    return { success: true, message: "Departure time updated" };
  } catch (error) {
    console.error("Error updating trip departure time:", error);
    return { success: false, message: "An error occurred while updating the departure time" };
  }
}

export async function getOpenTrips(
  page = 1,
  pageSize = 10,
  options: OpenTripSearchOptions = {}
) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 50);
  const offset = (safePage - 1) * safePageSize;
  const originFilter = options.origin?.trim().toLowerCase();
  const destinationFilter = options.destination?.trim().toLowerCase();
  const dateFilter = options.date?.trim();

  const passengerCountExpression = sql<number>`(
    SELECT COUNT(*)::int FROM ${tripBookings}
    WHERE ${tripBookings.tripId} = ${trips.id}
    AND ${tripBookings.status} != 'canceled'
  )`;

  // Build WHERE conditions
  const conditions: SQL[] = [
    eq(trips.canceled, false),
    sql`${trips.date} + ${trips.departureTime} > NOW()`,
  ];

  if (originFilter) {
    conditions.push(sql`LOWER(${trips.origin}) LIKE ${'%' + originFilter + '%'}`);
  }
  if (destinationFilter) {
    conditions.push(sql`LOWER(${trips.destination}) LIKE ${'%' + destinationFilter + '%'}`);
  }
  if (dateFilter) {
    conditions.push(eq(trips.date, dateFilter));
  }
  if (options.availableOnly) {
    conditions.push(sql`${passengerCountExpression} < ${trips.capacity}`);
  }

  const whereClause = and(...conditions);

  const [totalRow] = await db
    .select({ total: sql<number>`COUNT(*)::int` })
    .from(trips)
    .where(whereClause);

  const total = totalRow?.total ?? 0;

  // Single page query with passenger count via subquery
  const rows = await db
    .select({
      trip: trips,
      driverName: users.name,
      driverEmail: users.email,
      passengerCount: passengerCountExpression,
    })
    .from(trips)
    .leftJoin(users, eq(trips.driverId, users.id))
    .where(whereClause)
    .orderBy(trips.date, trips.departureTime)
    .limit(safePageSize)
    .offset(offset);

  // Fetch available seats only for the page we're returning
  const openTrips: OpenTripSummary[] = await Promise.all(
    rows.map(async (r) => {
      const availableSeats = await getAvailableSeats(r.trip.id);
      return {
        id: r.trip.id,
        driverId: r.trip.driverId,
        origin: r.trip.origin,
        destination: r.trip.destination,
        date: r.trip.date,
        departureTime: r.trip.departureTime,
        pricePerSeat: r.trip.pricePerSeat,
        capacity: r.trip.capacity,
        canceled: r.trip.canceled,
        driverName: r.driverName || "",
        driverEmail: r.driverEmail || "",
        passengerCount: r.passengerCount,
        availableSeats,
        state: "upcoming",
        isCanceled: false,
        isFullCapacity: r.passengerCount >= r.trip.capacity,
        isActive: true,
      };
    })
  );

  return { trips: openTrips, total, page: safePage, pageSize: safePageSize };
}

/**
 * Cancel a trip (driver only)
 */
export async function cancelTrip(tripId: number, userId: number): Promise<{ success: boolean; message: string }> {
  try {
    // Verify trip exists
    const tripData = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .limit(1);

    if (tripData.length === 0) {
      return { success: false, message: "Trip not found" };
    }

    const trip = tripData[0];

    // Check if user is the driver
    if (trip.driverId !== userId) {
      return { success: false, message: "Only the driver can cancel this trip" };
    }

    // Check if trip is upcoming
    const state = getTripState(trip.date, trip.departureTime);
    if (state !== "upcoming") {
      return { success: false, message: "Cannot cancel a trip that has already started" };
    }

    if (trip.canceled) {
      return { success: false, message: "This trip is already canceled" };
    }

    // Cancel the trip
    await db
      .update(trips)
      .set({ canceled: true })
      .where(eq(trips.id, tripId));

    return { success: true, message: "Trip has been canceled" };
  } catch (error) {
    console.error("Error canceling trip:", error);
    return { success: false, message: "An error occurred while canceling the trip" };
  }
}

export async function getDriverOverallRating(driverId: number): Promise<number> {
  const result = await db
    .select({
      averageRating: sql<number>`avg(${tripReviews.rating})`
    })
    .from(tripReviews)
    .innerJoin(trips, eq(tripReviews.tripId, trips.id))
    .where(eq(trips.driverId, driverId));

  const rating = result[0]?.averageRating;
  // Return the rating rounded to 1 decimal place, or 0 if no reviews exist
  return rating ? Math.round(Number(rating) * 10) / 10 : 0;
}
