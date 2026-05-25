import Link from "next/link";

export function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold hover:text-blue-200 transition">
              🚗 CarpoolGo
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="hover:text-blue-200 transition">
              Home
            </Link>
            <Link href="/login" className="hover:text-blue-200 transition">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm hover:text-blue-200 transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-semibold hover:bg-blue-50 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
