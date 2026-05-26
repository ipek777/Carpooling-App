import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export async function Footer() {
  const user = await getCurrentUser();
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">CarpoolGo</h3>
            <p className="text-sm">Share rides, save money, make friends.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <p className="text-sm">support@carpoolgo.com</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 CarpoolGo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
