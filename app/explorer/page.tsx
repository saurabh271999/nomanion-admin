"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { userAPI } from "../../api";
import { Button, Modal, message } from "antd";

interface Explorer {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  // Optional extra fields from API
  totalCountries?: number;
  destinationCovered?: string[];
  travelPreference?: string[];
  destinationPreference?: string[];
  favoriteActivity?: string[];
  notificationsEnabled?: boolean;
  isYoutubeVerified?: boolean;
  subscription?: string | null;
  coins?: number;
}

function Explorers() {
  const [explorers, setExplorers] = useState<Explorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [viewingExplorer, setViewingExplorer] = useState<Explorer | null>(null);
  const [editingExplorer, setEditingExplorer] = useState<Explorer | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    role: "",
    totalCountries: "",
    favoriteActivity: "",
    travelPreference: "",
    destinationPreference: "",
    subscription: "",
    coins: "",
    notificationsEnabled: false,
    isYoutubeVerified: false,
  });

  const fetchExplorers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (search) {
        params.search = search;
      }

      console.log("🔄 Fetching explorers...", params);
      const response = (await userAPI.getAllExplorers(params)) as any;
      console.log("📦 Explorers response:", response);

      setExplorers(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch explorers";
      setError(errorMessage);
      console.error("❌ Error fetching explorers:", err);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplorers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, search]);

  const handleView = (explorer: Explorer) => {
    setViewingExplorer(explorer);
  };

  const handleEdit = (explorer: Explorer) => {
    setEditingExplorer(explorer);
    setEditForm({
      fullName: explorer.fullName || "N/A",
      email: explorer.email || "N/A",
      role: explorer.role || "explorer",
      totalCountries:
        typeof explorer.totalCountries === "number"
          ? String(explorer.totalCountries)
          : "N/A",
      favoriteActivity:
        explorer.favoriteActivity && explorer.favoriteActivity.length > 0
          ? explorer.favoriteActivity.join(", ")
          : "N/A",
      travelPreference:
        explorer.travelPreference && explorer.travelPreference.length > 0
          ? explorer.travelPreference.join(", ")
          : "N/A",
      destinationPreference:
        explorer.destinationPreference &&
        explorer.destinationPreference.length > 0
          ? explorer.destinationPreference.join(", ")
          : "N/A",
      subscription: explorer.subscription || "N/A",
      coins:
        typeof explorer.coins === "number" ? String(explorer.coins) : "N/A",
      notificationsEnabled: explorer.notificationsEnabled ?? false,
      isYoutubeVerified: explorer.isYoutubeVerified ?? false,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingExplorer) return;

    try {
      const normalize = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed || trimmed === "N/A") return undefined;
        return trimmed;
      };

      const toArray = (value: string) => {
        const norm = normalize(value);
        return norm
          ? norm
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined;
      };

      const payload: any = {
        fullName: normalize(editForm.fullName),
        email: normalize(editForm.email),
        role: normalize(editForm.role),
        totalCountries:
          normalize(editForm.totalCountries) !== undefined
            ? Number(editForm.totalCountries)
            : undefined,
        favoriteActivity: toArray(editForm.favoriteActivity),
        travelPreference: toArray(editForm.travelPreference),
        destinationPreference: toArray(editForm.destinationPreference),
        subscription: normalize(editForm.subscription),
        coins:
          normalize(editForm.coins) !== undefined
            ? Number(editForm.coins)
            : undefined,
        notificationsEnabled: editForm.notificationsEnabled,
        isYoutubeVerified: editForm.isYoutubeVerified,
      };

      await userAPI.updateExplorer(editingExplorer._id, payload);
      message.success("Explorer updated successfully");
      setEditingExplorer(null);
      await fetchExplorers();
    } catch (err: any) {
      message.error(err.message || "Failed to update explorer");
    }
  };

  const handleCancelEdit = () => {
    setEditingExplorer(null);
    setEditForm({
      fullName: "",
      email: "",
      role: "",
      totalCountries: "",
      favoriteActivity: "",
      travelPreference: "",
      destinationPreference: "",
      subscription: "",
      coins: "",
      notificationsEnabled: false,
      isYoutubeVerified: false,
    });
  };

  const handleDelete = (explorer: Explorer) => {
    Modal.confirm({
      title: "Delete Explorer",
      content: `Are you sure you want to delete explorer "${explorer.fullName}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await userAPI.deleteExplorer(explorer._id);
          message.success("Explorer deleted successfully");
          await fetchExplorers();
        } catch (err: any) {
          message.error(err.message || "Failed to delete explorer");
        }
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Explorers</h1>
          <p className="text-gray-600 mt-1">
            Manage all explorer users in the platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setPagination({ ...pagination, page: 1 });
              setSearch(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button onClick={fetchExplorers} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {explorers.length === 0 && !loading ? (
          <div className="p-8 text-center text-gray-500">
            No explorers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {explorers.map((explorer) => (
                  <tr key={explorer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {explorer.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {explorer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {explorer.role || "explorer"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {explorer.createdAt
                        ? new Date(explorer.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          size="small"
                          onClick={() => handleView(explorer)}
                          style={{ color: "#722ed1", borderColor: "#722ed1" }}
                        >
                          View
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleEdit(explorer)}
                        >
                          Edit
                        </Button>
                        <Button
                          danger
                          size="small"
                          onClick={() => handleDelete(explorer)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total)
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page - 1 })
              }
              disabled={pagination.page === 1 || loading}
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page + 1 })
              }
              disabled={pagination.page >= pagination.totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      {/* View Modal */}
      <Modal
        open={!!viewingExplorer}
        onCancel={() => setViewingExplorer(null)}
        footer={null}
        title={viewingExplorer?.fullName || "Explorer details"}
      >
        {viewingExplorer && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-gray-900 font-medium">
                {viewingExplorer.fullName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{viewingExplorer.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                {viewingExplorer.role || "explorer"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="text-xs font-mono break-all text-gray-800">
                  {viewingExplorer._id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Joined</p>
                <p className="text-gray-900">
                  {viewingExplorer.createdAt
                    ? new Date(viewingExplorer.createdAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Notifications Enabled</p>
                <p className="text-gray-900">
                  {viewingExplorer.notificationsEnabled ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">YouTube Verified</p>
                <p className="text-gray-900">
                  {viewingExplorer.isYoutubeVerified ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Coins</p>
                <p className="text-gray-900">
                  {typeof viewingExplorer.coins === "number"
                    ? viewingExplorer.coins
                    : 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subscription ID</p>
                <p className="text-xs text-gray-900 break-all">
                  {viewingExplorer.subscription || "N/A"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Travel Preference</p>
              {viewingExplorer.travelPreference &&
              viewingExplorer.travelPreference.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {viewingExplorer.travelPreference.map((pref, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-900">N/A</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Destination Preference
              </p>
              {viewingExplorer.destinationPreference &&
              viewingExplorer.destinationPreference.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {viewingExplorer.destinationPreference.map((pref, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-800"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-900">N/A</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Favorite Activities</p>
              {viewingExplorer.favoriteActivity &&
              viewingExplorer.favoriteActivity.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {viewingExplorer.favoriteActivity.map((act, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-900">N/A</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Destinations Covered</p>
              {viewingExplorer.destinationCovered &&
              viewingExplorer.destinationCovered.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {viewingExplorer.destinationCovered.map((dest, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs rounded bg-green-100 text-green-800"
                    >
                      {dest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-900">N/A</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      {editingExplorer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Edit Explorer</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="explorer">Explorer</option>
                    <option value="nomad">Nomad</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Total Countries
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.totalCountries}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          totalCountries: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Coins
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.coins}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          coins: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Favorite Activities (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editForm.favoriteActivity}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        favoriteActivity: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Travel Preference (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editForm.travelPreference}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        travelPreference: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Destination Preference (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editForm.destinationPreference}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        destinationPreference: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Subscription ID
                  </label>
                  <input
                    type="text"
                    value={editForm.subscription}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        subscription: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={editForm.notificationsEnabled}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          notificationsEnabled: e.target.checked,
                        })
                      }
                    />
                    Notifications Enabled
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={editForm.isYoutubeVerified}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          isYoutubeVerified: e.target.checked,
                        })
                      }
                    />
                    YouTube Verified
                  </label>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <ProtectedRoute>
      <Explorers />
    </ProtectedRoute>
  );
}

