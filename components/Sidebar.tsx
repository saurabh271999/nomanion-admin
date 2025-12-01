"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import fullLogo from "../app/assests/images/full-logo.png";

const menuItems = [
  { name: "Dashboard", path: "/", icon: "📊" },
  { name: "Itineraries", path: "/itineraries", icon: "🗺️" },
  { name: "Published Itineraries", path: "/itineraries/published", icon: "✅" },
  { name: "Nomads", path: "/nomads", icon: "🧳" },
  { name: "Explorer", path: "/explorer", icon: "👤" },
  { name: "Subscription", path: "/subscription", icon: "💳" },
  { name: "Wallet", path: "/wallet", icon: "💰" },
  { name: "Pages", path: "/pages", icon: "📄" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Start closed on mobile
  const { isDark, setDark } = useTheme();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-[#DEFCED] text-white"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 border-r shadow-sm transform transition-transform duration-300 z-40 ${
          isDark
            ? "bg-gray-900 text-white border-gray-800"
            : "bg-white text-gray-900 border-[#DEFCED]"
        } ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="mb-8 flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-[#DEFCED] flex items-center justify-center">
              <Image
                src={fullLogo}
                alt="Nomanian Itinerary Expert"
                fill
                sizes="100px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide uppercase text-gray-800">
                Nomanian
              </span>
              <span className="text-xs text-gray-500 tracking-[0.2em]">
                Itinerary Expert
              </span>
            </div>
          </div>
          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? isDark
                        ? "bg-gray-800 text-white"
                        : "bg-[#DEFCED] text-gray-900"
                      : isDark
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Theme toggle + user info and logout */}
          <div className="mt-auto space-y-3 pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
            <div className="flex gap-2">
              <button
                onClick={() => setDark(false)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  !isDark
                    ? "bg-white text-gray-900 border-[#DEFCED]"
                    : "bg-transparent text-gray-300 border-gray-600 hover:bg-gray-800"
                }`}
              >
                🌞 White mode
              </button>
              <button
                onClick={() => setDark(true)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  isDark
                    ? "bg-gray-800 text-gray-100 border-gray-600"
                    : "bg-transparent text-gray-700 border-[#DEFCED] hover:bg-[#DEFCED]/40"
                }`}
              >
                🌙 Dark mode
              </button>
            </div>
          
          {/* User info and logout */}
          {isAuthenticated && user && (
              <div>
              <div className="px-4 py-2 mb-2">
                  <p className="text-sm text-gray-500">Logged in as</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.fullName || user.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </p>
              </div>
              <button
                onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

