import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPublicUserProfile } from "@/lib/services/users";
import { ProfileForm } from "./ProfileForm";

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  const initial = name.charAt(0).toUpperCase();

  if (photoUrl) {
    return (
      <div
        aria-label={`${name} profile photo`}
        className="h-24 w-24 rounded-full bg-cover bg-center ring-4 ring-blue-100"
        role="img"
        style={{ backgroundImage: `url(${photoUrl})` }}
      />
    );
  }

  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700 ring-4 ring-blue-50">
      {initial}
    </div>
  );
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/profile");
  }

  const profile = await getPublicUserProfile(user.id);
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <Link href={`/users/${user.id}`} className="mb-4 inline-flex font-semibold text-blue-600 hover:text-blue-700">
          View public profile
        </Link>
        <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-600">Manage how your profile appears to other carpoolers.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <Avatar name={profile.name} photoUrl={profile.photoUrl} />
          <h2 className="mt-5 text-2xl font-bold text-gray-900">{profile.name}</h2>
          <p className="mt-1 text-gray-600">{profile.email}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xl font-bold text-gray-900">{profile.tripsDriven}</p>
              <p className="text-xs font-semibold text-gray-600">Driven</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xl font-bold text-gray-900">{profile.tripsJoined}</p>
              <p className="text-xs font-semibold text-gray-600">Joined</p>
            </div>
          </div>
        </aside>

        <ProfileForm initialName={profile.name} initialPhotoUrl={profile.photoUrl || ""} />
      </div>
    </div>
  );
}
