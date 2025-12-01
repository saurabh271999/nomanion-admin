"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { itineraryAPI } from "../../../api";
import { Button, message } from "antd";

interface Itinerary {
  _id: string;
  title: string;
  description: string;
  country: string;
  state: string;
  city: string;
  travelType: string;
  isPublished: boolean;
  createdAt: string;
  createdBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
}

function PublishedItineraries() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchPublished = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = (await itineraryAPI.getPublished({
        page: pagination.page,
        limit: pagination.limit,
      })) as any;

      const data = response.data || [];
      const paginationData = response.pagination || {};

      setItineraries(data);
      setPagination((prev) => ({
        ...prev,
        ...paginationData,
      }));
    } catch (err: any) {
      const msg = err.message || "Failed to fetch published itineraries";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublished();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Published Itineraries
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View all itineraries that are currently live on the platform.
          </p>
        </div>
        <Button onClick={fetchPublished} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-gray-600">
            Loading itineraries...
          </div>
        ) : itineraries.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No published itineraries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="w-1/4 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="w-1/5 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Location
                  </th>
                  <th className="w-1/5 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Nomad
                  </th>
                  <th className="w-1/6 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Created On
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {itineraries.map((itinerary) => (
                  <tr key={itinerary._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {itinerary.title}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {itinerary.description}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {itinerary.city || "N/A"},{" "}
                      {itinerary.state || "N/A"},{" "}
                      {itinerary.country}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      <div className="font-medium text-gray-900">
                        {itinerary.createdBy?.fullName || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {itinerary.createdBy?.email || "N/A"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(itinerary.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-gray-700">
          <div>
            Showing page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total)
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: prev.page - 1,
                }))
              }
              disabled={pagination.page === 1 || loading}
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: prev.page + 1,
                }))
              }
              disabled={
                pagination.page >= pagination.totalPages || loading
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublishedItinerariesPage() {
  return (
    <ProtectedRoute>
      <PublishedItineraries />
    </ProtectedRoute>
  );
}


