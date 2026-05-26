import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPublicUserProfile } from "@/lib/services/users";

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  const initial = name.charAt(0).toUpperCase();

  if (photoUrl) {
    return (
      <div
        aria-label={`${name} profile photo`}
        className="h-28 w-28 rounded-full bg-cover bg-center ring-4 ring-blue-100"
        role="img"
        style={{ backgroundImage: `url(${photoUrl})` }}
      />
    );
  }

  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-4xl font-bold text-blue-700 ring-4 ring-blue-50">
      {initial}
    </div>
  );
}

function formatJoinDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    const { id } = await params;
    redirect(`/login?next=/users/${id}`);
  }

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    notFound();
  }

  const profile = await getPublicUserProfile(userId);
  if (!profile) {
    notFound();
  }

  const isCurrentUser = currentUser.id === profile.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <Link href="/trips" className="mb-4 inline-flex font-semibold text-blue-600 hover:text-blue-700">
          Back to trips
        </Link>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar name={profile.name} photoUrl={profile.photoUrl} />
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900">{profile.name}</h1>
              <p className="mt-2 text-gray-600">{profile.email}</p>
              <p className="mt-1 text-sm text-gray-500">Member since {formatJoinDate(profile.createdAt)}</p>
            </div>
            {isCurrentUser ? (
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Edit Profile
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-600">Trips driven</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{profile.tripsDriven}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-600">Trips joined</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{profile.tripsJoined}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-600">Driver rating</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {profile.averageRating > 0 ? `${profile.averageRating}/5` : "New"}
          </p>
        </div>
      </div>
    </div>
  );
}
