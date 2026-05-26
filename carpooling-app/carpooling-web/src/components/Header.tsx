import Link from "next/link";
import { getCurrentUser, logoutAction } from "@/lib/auth";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold hover:text-blue-200 transition">
              CarpoolGo
            </Link>
            {user ? (
              <span className="hidden sm:inline text-sm text-blue-100">
                | Signed in as <strong>{user.name}</strong>
              </span>
            ) : null}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-blue-200 transition">
              Home
            </Link>
            {user ? (
              <>
                <Link href="/trips" className="hover:text-blue-200 transition">
                  Find Trips
                </Link>
                <Link href="/trips/new" className="hover:text-blue-200 transition">
                  Create Trip
                </Link>
                <Link href="/dashboard" className="hover:text-blue-200 transition">
                  Dashboard
                </Link>
                <Link href="/profile" className="hover:text-blue-200 transition">
                  Profile
                </Link>
                <form action={logoutAction} className="inline">
                  <button
                    type="submit"
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-blue-200 transition">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            {user ? (
              <>
                <Link href="/trips" className="text-sm hover:text-blue-200 transition">
                  Find
                </Link>
                <Link href="/trips/new" className="text-sm hover:text-blue-200 transition">
                  Create
                </Link>
                <Link href="/dashboard" className="text-sm hover:text-blue-200 transition">
                  Dashboard
                </Link>
                <Link href="/profile" className="text-sm hover:text-blue-200 transition">
                  Profile
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-semibold hover:bg-blue-50 transition"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm hover:text-blue-200 transition">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-semibold hover:bg-blue-50 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
