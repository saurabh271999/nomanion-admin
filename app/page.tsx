"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { statsAPI } from "../api";

interface DashboardStats {
  today?: {
    itinerariesUploaded?: number;
    newExplorers?: number;
    newNomads?: number;
  };
  subscriptions?: {
    totalActive?: number;
    total?: number;
  };
  users?: {
    totalNomads?: number;
    totalExplorers?: number;
    totalNomadsAndExplorers?: number;
    total?: number;
  };
  itineraries?: {
    total?: number;
    published?: number;
    drafts?: number;
  };
  [key: string]: any; // Allow for additional stats
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching dashboard stats...");
      
      const response = await statsAPI.getStats() as any;
      console.log("📊 Dashboard stats response:", response);
      
      // Handle response structure: { message, data } or direct data
      const statsData = response.data || response || {};
      setStats(statsData);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch dashboard stats";
      setError(errorMessage);
      console.error("❌ Error fetching dashboard stats:", {
        error: err,
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    color = "red",
    icon,
  }: {
    title: string;
    value: number | string | undefined;
    color?: "red" | "orange" | "green" | "purple" | "pink" | "teal" | "indigo" | "blue";
    icon?: React.ReactNode;
  }) => {
    const palette: Record<
      string,
      { card: string; iconBg: string; text: string }
    > = {
      red: {
        card: "from-red-50 to-red-100",
        iconBg: "bg-red-500",
        text: "text-red-700",
      },
      orange: {
        card: "from-orange-50 to-orange-100",
        iconBg: "bg-orange-500",
        text: "text-orange-700",
      },
      green: {
        card: "from-emerald-50 to-emerald-100",
        iconBg: "bg-emerald-500",
        text: "text-emerald-700",
      },
      purple: {
        card: "from-purple-50 to-purple-100",
        iconBg: "bg-purple-500",
        text: "text-purple-700",
      },
      pink: {
        card: "from-pink-50 to-pink-100",
        iconBg: "bg-pink-500",
        text: "text-pink-700",
      },
      teal: {
        card: "from-teal-50 to-teal-100",
        iconBg: "bg-teal-500",
        text: "text-teal-700",
      },
      indigo: {
        card: "from-indigo-50 to-indigo-100",
        iconBg: "bg-indigo-500",
        text: "text-indigo-700",
      },
      blue: {
        card: "from-sky-50 to-sky-100",
        iconBg: "bg-sky-500",
        text: "text-sky-700",
      },
    };

    const theme = palette[color] ?? palette.red;

    return (
      <div className={`relative overflow-hidden bg-gradient-to-br ${theme.card} shadow-sm`}>
        <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" />
        <div className="relative flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {title}
            </p>
            <p className={`mt-3 text-3xl font-extrabold ${theme.text}`}>
              {loading ? (
                <span className="inline-block w-7 h-7 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : value !== undefined ? (
                typeof value === "number" ? value.toLocaleString() : value
              ) : (
                "0"
              )}
            </p>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center text-white shadow ${theme.iconBg}`}
          >
            {icon}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 rounded-b-xl bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Error loading stats</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {/* Main Stats - Itineraries & Users (original card details, new styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
        <StatCard
          title="Total Itineraries"
          value={stats.itineraries?.total}
          color="blue"
          icon={<span className="text-xl">🗺️</span>}
        />
        <StatCard
          title="Published Itineraries"
          value={stats.itineraries?.published}
          color="green"
          icon={<span className="text-xl">✅</span>}
        />
        <StatCard
          title="Draft Itineraries"
          value={stats.itineraries?.drafts}
          color="orange"
          icon={<span className="text-xl">📝</span>}
        />
        <StatCard
          title="Total Users"
          value={stats.users?.total}
          color="indigo"
          icon={<span className="text-xl">👥</span>}
        />
         <StatCard
          title="Total Nomads"
          value={stats.users?.totalNomads}
          color="purple"
          icon={<span className="text-xl">🧳</span>}
        />
        <StatCard
          title="Total Explorers"
          value={stats.users?.totalExplorers}
          color="teal"
          icon={<span className="text-xl">👤</span>}
        />
        <StatCard
          title="Nomads & Explorers"
          value={stats.users?.totalNomadsAndExplorers}
          color="blue"
          icon={<span className="text-xl">🌟</span>}
        />
         <StatCard
          title="Total Nomads"
          value={stats.users?.totalNomads}
          color="purple"
          icon={<span className="text-xl">🧳</span>}
        />
        <StatCard
          title="Total Explorers"
          value={stats.users?.totalExplorers}
          color="teal"
          icon={<span className="text-xl">👤</span>}
        />
        <StatCard
          title="Nomads & Explorers"
          value={stats.users?.totalNomadsAndExplorers}
          color="blue"
          icon={<span className="text-xl">🌟</span>}
        />
          <StatCard
          title="Total Subscriptions"
          value={stats.subscriptions?.total}
          color="pink"
          icon={<span className="text-xl">💳</span>}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.subscriptions?.totalActive}
          color="green"
          icon={<span className="text-xl">✨</span>}
        />
      </div>

      {/* Users Breakdown (original details) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
       
      </div>

      {/* Subscriptions (original details) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
      
      </div>

      {/* Today's Activity (original details) */}
      {stats.today && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Today&apos;s Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              title="Itineraries Uploaded Today"
              value={stats.today.itinerariesUploaded}
              color="green"
              icon={<span className="text-xl">📤</span>}
            />
            <StatCard
              title="New Explorers Today"
              value={stats.today.newExplorers}
              color="blue"
              icon={<span className="text-xl">🆕</span>}
            />
            <StatCard
              title="New Nomads Today"
              value={stats.today.newNomads}
              color="purple"
              icon={<span className="text-xl">🆕</span>}
            />
          </div>
        </div>
      )}

      {/* Bottom charts-style section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Total Entries / simple line chart look */}
        <div className="bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Total Entries</p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">
            {stats.entries?.total ?? 0}
          </p>
          <div className="mt-6 h-40 w-full rounded-xl bg-gradient-to-t from-indigo-100 via-sky-100 to-white flex items-end justify-center">
            <div className="w-full max-w-md">
              <div className="h-32 w-full rounded-full border-2 border-indigo-500 border-t-transparent border-x-transparent" />
            </div>
          </div>
        </div>

        {/* Right: Weekly Revenue / bar chart look */}
        <div className="bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-500">Weekly Revenue</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />{" "}
                Active
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-sky-400" />{" "}
                Pending
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />{" "}
                Deleted
              </span>
            </div>
          </div>
          <div className="mt-4 flex h-44 items-end gap-3">
            {[10, 25, 15, 30, 18].map((v, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex w-full items-end gap-1">
                  <div
                    className="flex-1 rounded-t-lg bg-indigo-500"
                    style={{ height: `${v * 3}px` }}
                  />
                  <div
                    className="flex-1 rounded-t-lg bg-sky-400 opacity-70"
                    style={{ height: `${Math.max(4, v - 5) * 2.5}px` }}
                  />
                  <div
                    className="flex-1 rounded-t-lg bg-gray-200"
                    style={{ height: `${Math.max(2, v - 8) * 1.8}px` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">
                  {stats.revenue?.weeks?.[idx]?.label ?? ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
