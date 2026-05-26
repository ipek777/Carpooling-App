import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-[calc(100vh-300px)]">
      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-emerald-50 px-6 py-14 shadow-xl shadow-blue-900/10 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-5 inline-flex rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            Smarter shared rides
          </div>

          <h1 className="text-5xl font-bold text-gray-950 md:text-6xl">
            Welcome to <span className="text-blue-600">CarpoolGo</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-gray-600">
            Share rides with people heading your way. Save money, reduce your carbon footprint, and
            make new friends on the road.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/trips"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Find Trips
            </Link>
            {user ? (
              <Link
                href="/trips/new"
                className="inline-flex items-center justify-center rounded-xl border-2 border-blue-200 bg-white px-8 py-3 text-lg font-semibold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
              >
                Create Trip
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="my-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700">
            $
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900">Save Money</h3>
          <p className="text-sm text-gray-600">Split fuel costs with fellow commuters.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
            CO2
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900">Eco-Friendly</h3>
          <p className="text-sm text-gray-600">Reduce emissions by sharing your ride.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">
            Hi
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900">Make Friends</h3>
          <p className="text-sm text-gray-600">Connect with people in your community.</p>
        </div>
      </section>

      {!user ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-md">
          <h2 className="text-2xl font-bold text-gray-900">Ready to ride together?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-600">
            Create an account or sign in to join available trips and manage your carpools.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-lg border-2 border-blue-200 bg-white px-8 py-3 text-lg font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
            >
              Sign In
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
