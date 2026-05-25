import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome, {user.name}</h1>
      <p className="text-gray-600 mb-6">Your registered email is {user.email}.</p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-3">Ride history</h2>
          <p className="text-gray-600">Protected content goes here for logged-in users.</p>
        </div>
        <div className="rounded-3xl border border-gray-200 p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-3">Account</h2>
          <p className="text-gray-600">Access profile information and upcoming trips.</p>
        </div>
      </div>
    </div>
  );
}
