"use server";

import { eq, sql, ne, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, trips, tripBookings, tripReviews } from "@/db/drizzle.schema";

export interface PublicUserProfile {
  id: number;
  name: string;
  email: string;
  photoUrl: string | null;
  createdAt: Date;
  tripsDriven: number;
  tripsJoined: number;
  averageRating: number;
}

export async function getPublicUserProfile(userId: number): Promise<PublicUserProfile | null> {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      photoUrl: users.photoUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  const [drivenRow] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(trips)
    .where(eq(trips.driverId, userId));

  const [joinedRow] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(tripBookings)
    .where(
      and(
        eq(tripBookings.passengerId, userId),
        ne(tripBookings.status, "canceled")
      )
    );

  const [ratingRow] = await db
    .select({ averageRating: sql<number>`avg(${tripReviews.rating})` })
    .from(tripReviews)
    .innerJoin(trips, eq(tripReviews.tripId, trips.id))
    .where(eq(trips.driverId, userId));

  const rating = ratingRow?.averageRating;

  return {
    ...user,
    tripsDriven: drivenRow?.count ?? 0,
    tripsJoined: joinedRow?.count ?? 0,
    averageRating: rating ? Math.round(Number(rating) * 10) / 10 : 0,
  };
}

export async function updateUserProfile(
  userId: number,
  input: { name: string; photoUrl: string | null }
): Promise<{ success: boolean; message: string }> {
  try {
    const name = input.name.trim();
    const photoUrl = input.photoUrl?.trim() || null;

    if (!name) {
      return { success: false, message: "Name is required" };
    }

    if (name.length > 150) {
      return { success: false, message: "Name must be 150 characters or less" };
    }

    if (photoUrl) {
      try {
        const url = new URL(photoUrl);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          return { success: false, message: "Photo URL must start with http:// or https://" };
        }
      } catch {
        return { success: false, message: "Photo URL must be a valid URL" };
      }
    }

    await db
      .update(users)
      .set({
        name,
        photoUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return { success: true, message: "Profile updated" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "An error occurred while updating your profile" };
  }
}
