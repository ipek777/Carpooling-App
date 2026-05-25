import {
  pgEnum,
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  integer,
  numeric,
  date,
  time,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const bookingStatus = pgEnum("booking_status", ["pending", "confirmed", "canceled"]);
export const seatPositions = pgEnum("seat_position", ["front", "back_left", "back_middle", "back_right"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const trips = pgTable(
  "trips",
  {
    id: serial("id").primaryKey(),
    driverId: integer("driver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    origin: varchar("origin", { length: 200 }).notNull(),
    destination: varchar("destination", { length: 200 }).notNull(),
    date: date("date").notNull(),
    departureTime: time("departure_time").notNull(),
    pricePerSeat: numeric("price_per_seat", { precision: 10, scale: 2 }).notNull(),
    capacity: integer("capacity").notNull(),
    canceled: boolean("canceled").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (trip) => ({
    originIndex: index("trips_origin_idx").on(trip.origin),
    destinationIndex: index("trips_destination_idx").on(trip.destination),
    dateIndex: index("trips_date_idx").on(trip.date),
    driverIndex: index("trips_driver_id_idx").on(trip.driverId),
  })
);

export const tripBookings = pgTable(
  "trip_bookings",
  {
    id: serial("id").primaryKey(),
    tripId: integer("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
    passengerId: integer("passenger_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    seatPosition: seatPositions("seat_position").notNull(),
    status: bookingStatus("status").notNull().default("confirmed"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (booking) => ({
    tripSeatUnique: uniqueIndex("trip_bookings_trip_id_seat_position_unique").on(
      booking.tripId,
      booking.seatPosition
    ).where(sql`${booking.status} != 'canceled'`),
    tripPassengerIndex: index("trip_bookings_trip_id_passenger_id_idx").on(
      booking.tripId,
      booking.passengerId
    ),
  })
);

export const tripComments = pgTable(
  "trip_comments",
  {
    id: serial("id").primaryKey(),
    tripId: integer("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    commentDate: timestamp("comment_date").notNull().defaultNow(),
    text: text("text").notNull(),
  },
  (comment) => ({
    tripIndex: index("trip_comments_trip_id_idx").on(comment.tripId),
    userIndex: index("trip_comments_user_id_idx").on(comment.userId),
  })
);

export const tripReviews = pgTable(
  "trip_reviews",
  {
    id: serial("id").primaryKey(),
    tripId: integer("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
    reviewerId: integer("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    reviewDate: timestamp("review_date").notNull().defaultNow(),
    rating: integer("rating").notNull(),
    text: text("text"),
  },
  (review) => ({
    tripReviewerUnique: uniqueIndex("trip_reviews_trip_id_reviewer_id_unique").on(
      review.tripId,
      review.reviewerId
    ),
    tripIndex: index("trip_reviews_trip_id_idx").on(review.tripId),
  })
);