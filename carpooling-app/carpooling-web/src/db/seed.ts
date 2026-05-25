import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import * as schema from "./drizzle.schema";

config();

const db = drizzle(process.env.DATABASE_URL!, { schema });

async function seed() {
  console.log("Seeding database");

  // Hash password
  const hashedPassword = await bcrypt.hash("pass123", 10);

  // Create sample users
  const users = await db
    .insert(schema.users)
    .values([
      { email: "lora@gmail.com", passwordHash: hashedPassword, name: "Lora Smith", photoUrl: null },
      { email: "peter@gmail.com", passwordHash: hashedPassword, name: "Peter Parker", photoUrl: null },
      { email: "dave@gmail.com", passwordHash: hashedPassword, name: "Dave Franco", photoUrl: null },
      { email: "john@gmail.com", passwordHash: hashedPassword, name: "John Doe", photoUrl: null },
      { email: "jane@gmail.com", passwordHash: hashedPassword, name: "Jane Doe", photoUrl: null },
      { email: "lola@gmail.com", passwordHash: hashedPassword, name: "Lola Bunny", photoUrl: null },
      { email: "bugs@gmail.com", passwordHash: hashedPassword, name: "Bugs Bunny", photoUrl: null },
      { email: "daffy@gmail.com", passwordHash: hashedPassword, name: "Daffy Duck", photoUrl: null },
    ])
    .returning();

  const userMap = users.reduce(
    (acc, user) => {
      acc[user.name] = user.id;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log("Created 8 sample users");

  // Create sample trips
  const today = new Date();
  const trip1Date = new Date(today);
  trip1Date.setDate(trip1Date.getDate() + 3);
  trip1Date.setHours(0, 0, 0, 0);

  const trip2Date = new Date(today);
  trip2Date.setDate(trip2Date.getDate() - 1);
  trip2Date.setHours(0, 0, 0, 0);

  const trips = await db
    .insert(schema.trips)
    .values([
      {
        driverId: userMap["Lora Smith"],
        origin: "Sofia",
        destination: "Haskovo",
        date: trip1Date.toISOString().split("T")[0],
        departureTime: "12:00",
        pricePerSeat: "10.00",
        capacity: 4,
        canceled: false,
      },
      {
        driverId: userMap["Peter Parker"],
        origin: "Varna",
        destination: "Plovdiv",
        date: trip2Date.toISOString().split("T")[0],
        departureTime: "16:00",
        pricePerSeat: "20.00",
        capacity: 4,
        canceled: false,
      },
    ])
    .returning();

  console.log("Created 2 sample trips");

  // Create sample bookings
  const bookings = await db
    .insert(schema.tripBookings)
    .values([
      // First trip: Bugs Bunny and Daffy Duck
      {
        tripId: trips[0].id,
        passengerId: userMap["Bugs Bunny"],
        seatPosition: "front",
        status: "confirmed",
      },
      {
        tripId: trips[0].id,
        passengerId: userMap["Daffy Duck"],
        seatPosition: "back_left",
        status: "confirmed",
      },
      // Second trip: Dave Franco, John Doe, Jane Doe (canceled)
      {
        tripId: trips[1].id,
        passengerId: userMap["Dave Franco"],
        seatPosition: "front",
        status: "confirmed",
      },
      {
        tripId: trips[1].id,
        passengerId: userMap["John Doe"],
        seatPosition: "back_left",
        status: "confirmed",
      },
      {
        tripId: trips[1].id,
        passengerId: userMap["Jane Doe"],
        seatPosition: "back_middle",
        status: "canceled",
      },
    ])
    .returning();

  console.log("Created 5 sample bookings");

  // Create sample reviews for the second trip (past trip)
  await db
    .insert(schema.tripReviews)
    .values([
      {
        tripId: trips[1].id,
        reviewerId: userMap["Dave Franco"],
        rating: 5,
        text: "Excellent ride! Peter was very friendly and the car was clean. Highly recommended!",
      },
      {
        tripId: trips[1].id,
        reviewerId: userMap["John Doe"],
        text: "Great experience. The driver was punctual and took a nice route. Would ride again!",
        rating: 4,
      },
    ])
    .returning();

  console.log("Created 2 sample reviews");

  // Create sample comments
  await db
    .insert(schema.tripComments)
    .values([
      // Trip 1 comments
      {
        tripId: trips[0].id,
        userId: userMap["Lora Smith"],
        text: "Looking forward to this trip! Please be ready by 11:45 AM.",
      },
      {
        tripId: trips[0].id,
        userId: userMap["Bugs Bunny"],
        text: "Thanks for organizing! I'll bring some snacks for the ride.",
      },
      {
        tripId: trips[0].id,
        userId: userMap["Daffy Duck"],
        text: "Anyone know a good rest stop on the way to Haskovo?",
      },
      // Trip 2 comments
      {
        tripId: trips[1].id,
        userId: userMap["Peter Parker"],
        text: "Thanks everyone for joining! Safe travels to Plovdiv.",
      },
      {
        tripId: trips[1].id,
        userId: userMap["Dave Franco"],
        text: "Great ride! The conversation was enjoyable.",
      },
      {
        tripId: trips[1].id,
        userId: userMap["John Doe"],
        text: "Perfect timing and route. Thanks Peter!",
      },
    ])
    .returning();

  console.log("Created 6 sample comments");

  console.log("\nDatabase seeding completed successfully!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
