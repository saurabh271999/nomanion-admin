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
    color = "gray", 
    icon 
  }: { 
    title: string; 
    value: number | string | undefined; 
    color?: string;
    icon?: string;
  }) => {
    const colorClasses: { [key: string]: string } = {
      gray: "text-gray-900",
      green: "text-green-600",
      yellow: "text-yellow-600",
      blue: "text-blue-600",
      purple: "text-purple-600",
      red: "text-red-600",
      indigo: "text-indigo-600",
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
            <p className={`text-3xl font-bold ${colorClasses[color]}`}>
              {loading ? (
                <span className="inline-block w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
              ) : value !== undefined ? (
                typeof value === "number" ? value.toLocaleString() : value
              ) : (
                "-"
              )}
            </p>
          </div>
          {icon && (
            <div className="text-4xl opacity-20">{icon}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Error loading stats</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {/* Main Stats - Itineraries & Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Total Itineraries" 
          value={stats.itineraries?.total} 
          color="gray"
          icon="🗺️"
        />
        <StatCard 
          title="Published Itineraries" 
          value={stats.itineraries?.published} 
          color="green"
          icon="✅"
        />
        <StatCard 
          title="Draft Itineraries" 
          value={stats.itineraries?.drafts} 
          color="yellow"
          icon="📝"
        />
        <StatCard 
          title="Total Users" 
          value={stats.users?.total} 
          color="blue"
          icon="👥"
        />
      </div>

      {/* Users Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard 
          title="Total Nomads" 
          value={stats.users?.totalNomads} 
          color="purple"
          icon="🧳"
        />
        <StatCard 
          title="Total Explorers" 
          value={stats.users?.totalExplorers} 
          color="indigo"
          icon="👤"
        />
        <StatCard 
          title="Nomads & Explorers" 
          value={stats.users?.totalNomadsAndExplorers} 
          color="blue"
          icon="🌟"
        />
      </div>

      {/* Subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatCard 
          title="Total Subscriptions" 
          value={stats.subscriptions?.total} 
          color="purple"
          icon="💳"
        />
        <StatCard 
          title="Active Subscriptions" 
          value={stats.subscriptions?.totalActive} 
          color="green"
          icon="✨"
        />
      </div>

      {/* Today's Activity */}
      {stats.today && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Itineraries Uploaded Today" 
              value={stats.today.itinerariesUploaded} 
              color="green"
              icon="📤"
            />
            <StatCard 
              title="New Explorers Today" 
              value={stats.today.newExplorers} 
              color="blue"
              icon="🆕"
            />
            <StatCard 
              title="New Nomads Today" 
              value={stats.today.newNomads} 
              color="purple"
              icon="🆕"
            />
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Welcome to Admin Dashboard</h2>
        <p className="text-gray-600 mb-4">
          Manage itineraries, nomads, subscriptions, and more from this dashboard.
        </p>
        {!loading && Object.keys(stats).length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        )}
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
