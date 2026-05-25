import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)]">
      {/* Welcome Section */}
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-blue-600">CarpoolGo</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Share rides with people heading your way. Save money, reduce your carbon footprint, and
          make new friends on the road.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-bold text-lg mb-2">Save Money</h3>
            <p className="text-gray-600 text-sm">Split fuel costs with fellow commuters.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-3">🌍</div>
            <h3 className="font-bold text-lg mb-2">Eco-Friendly</h3>
            <p className="text-gray-600 text-sm">Reduce emissions by sharing your ride.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-bold text-lg mb-2">Make Friends</h3>
            <p className="text-gray-600 text-sm">Connect with people in your community.</p>
          </div>
        </div>

        {/* Call to Action */}
        {!user && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition text-lg"
            >
              Sign In
            </Link>
          </div>
        )}
        {user && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
        <div>
          <div className="text-3xl font-bold text-blue-600">10K+</div>
          <p className="text-gray-600">Active Users</p>
        </div>
        <div>
          <div className="text-3xl font-bold text-blue-600">50K+</div>
          <p className="text-gray-600">Trips Completed</p>
        </div>
        <div>
          <div className="text-3xl font-bold text-blue-600">$1M+</div>
          <p className="text-gray-600">Money Saved</p>
        </div>
      </div>
    </div>
  );
}
