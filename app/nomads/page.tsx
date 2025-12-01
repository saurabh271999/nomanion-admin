"use client";

import { useState, useEffect } from "react";
import { userAPI } from "../../api";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Modal, Button, Image, message } from "antd";
import { useAuth } from "../../contexts/AuthContext";

interface Nomad {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  role: string;
  profilePic?: string;
  coverImage?: string;
  bio?: string;
  gender?: string;
  isDisabled: boolean;
  createdAt: string;
  totalCountries?: number;
  destinationCovered?: string[];
  startingYearOfTraveling?: string;
  favoriteActivity?: string[];
  favoriteDestination?: string;
  socialMedia?: {
    instagram?: string;
    youtube?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  notificationsEnabled?: boolean;
  travelPreference?: string[];
  destinationPreference?: string[];
  isYoutubeVerified?: boolean;
  subscription?: string;
  coins?: number;
}

function Nomads() {
  const [nomads, setNomads] = useState<Nomad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [viewingNomad, setViewingNomad] = useState<Nomad | null>(null);
  const [editingNomad, setEditingNomad] = useState<Nomad | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    bio: "",
    role: "",
    gender: "",
    startingYearOfTraveling: "",
    favoriteDestination: "",
    favoriteActivity: "",
    totalCountries: "",
    isDisabled: false,
    isYoutubeVerified: false,
    notificationsEnabled: false,
    travelPreference: "",
    destinationPreference: "",
    instagram: "",
    twitter: "",
    facebook: "",
    linkedin: "",
    youtube: "",
    latitude: "",
    longitude: "",
    subscription: "",
    coins: "",
  });

  const { isAdmin } = useAuth();

  const fetchNomads = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, unknown> = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (search) {
        params.search = search;
      }

      const response = (await userAPI.getAllNomads(
        params
      )) as {
        data?: Nomad[];
        pagination?: typeof pagination;
      };
      setNomads(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : "Failed to fetch nomads";
      setError(messageText);
      console.error("Error fetching nomads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNomads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, search]);

  const handleView = async (id: string) => {
    try {
      // Get full nomad details by fetching from the list or making a separate API call
      const nomad = nomads.find((n) => n._id === id);
      if (nomad) {
        setViewingNomad(nomad);
      } else {
        // If not found in list (should be rare), show a warning
        message.warning("Nomad details not available");
      }
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : "Failed to fetch nomad details";
      message.error(messageText);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Modal.confirm({
      title: "Delete Nomad",
      content: `Are you sure you want to delete nomad "${name}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await userAPI.deleteNomad(id);
          message.success("Nomad deleted successfully!");
          fetchNomads();
        } catch (err) {
          const messageText =
            err instanceof Error ? err.message : "Failed to delete nomad";
          message.error(messageText);
        }
      },
    });
  };

  const handleEdit = (nomad: Nomad) => {
    setEditingNomad(nomad);
    setEditForm({
      fullName: nomad.fullName || "N/A",
      email: nomad.email || "N/A",
      mobileNumber: nomad.mobileNumber || "N/A",
      bio: nomad.bio || "N/A",
      role: nomad.role || "N/A",
      gender: nomad.gender || "N/A",
      startingYearOfTraveling: nomad.startingYearOfTraveling || "N/A",
      favoriteDestination: nomad.favoriteDestination || "N/A",
      favoriteActivity:
        nomad.favoriteActivity && nomad.favoriteActivity.length > 0
          ? nomad.favoriteActivity.join(", ")
          : "N/A",
      totalCountries:
        typeof nomad.totalCountries === "number"
          ? String(nomad.totalCountries)
          : "N/A",
      isDisabled: nomad.isDisabled ?? false,
      isYoutubeVerified: nomad.isYoutubeVerified ?? false,
      notificationsEnabled: nomad.notificationsEnabled ?? false,
      travelPreference:
        nomad.travelPreference && nomad.travelPreference.length > 0
          ? nomad.travelPreference.join(", ")
          : "N/A",
      destinationPreference:
        nomad.destinationPreference && nomad.destinationPreference.length > 0
          ? nomad.destinationPreference.join(", ")
          : "N/A",
      instagram: nomad.socialMedia?.instagram || "N/A",
      twitter: nomad.socialMedia?.twitter || "N/A",
      facebook: nomad.socialMedia?.facebook || "N/A",
      linkedin: nomad.socialMedia?.linkedin || "N/A",
      youtube: nomad.socialMedia?.youtube || "N/A",
      latitude:
        typeof nomad.coordinates?.latitude === "number"
          ? String(nomad.coordinates.latitude)
          : "N/A",
      longitude:
        typeof nomad.coordinates?.longitude === "number"
          ? String(nomad.coordinates.longitude)
          : "N/A",
      subscription: nomad.subscription || "N/A",
      coins:
        typeof nomad.coins === "number" ? String(nomad.coins) : "N/A",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingNomad) return;

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

      const payload: Record<string, unknown> = {
        fullName: normalize(editForm.fullName),
        email: normalize(editForm.email),
        mobileNumber: normalize(editForm.mobileNumber),
        bio: normalize(editForm.bio),
        role: normalize(editForm.role),
        gender: normalize(editForm.gender),
        startingYearOfTraveling: normalize(
          editForm.startingYearOfTraveling
        ),
        favoriteDestination: normalize(editForm.favoriteDestination),
        totalCountries:
          normalize(editForm.totalCountries) !== undefined
            ? Number(editForm.totalCountries)
            : undefined,
        favoriteActivity: toArray(editForm.favoriteActivity),
        travelPreference: toArray(editForm.travelPreference),
        destinationPreference: toArray(editForm.destinationPreference),
        isDisabled: editForm.isDisabled,
        isYoutubeVerified: editForm.isYoutubeVerified,
        notificationsEnabled: editForm.notificationsEnabled,
        subscription: normalize(editForm.subscription),
        coins:
          normalize(editForm.coins) !== undefined
            ? Number(editForm.coins)
            : undefined,
      };

      const social: Record<string, string | undefined> = {
        instagram: normalize(editForm.instagram),
        twitter: normalize(editForm.twitter),
        facebook: normalize(editForm.facebook),
        linkedin: normalize(editForm.linkedin),
        youtube: normalize(editForm.youtube),
      };
      if (Object.values(social).some((v) => v !== undefined)) {
        payload.socialMedia = social;
      }

      const latNorm = normalize(editForm.latitude);
      const lngNorm = normalize(editForm.longitude);
      if (latNorm !== undefined && lngNorm !== undefined) {
        payload.coordinates = {
          latitude: Number(editForm.latitude),
          longitude: Number(editForm.longitude),
        };
      }

      await userAPI.updateNomad(editingNomad._id, payload);
      message.success("Nomad updated successfully!");
      setEditingNomad(null);
      fetchNomads();
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : "Failed to update nomad";
      message.error(messageText);
    }
  };

  const handleCancelEdit = () => {
    setEditingNomad(null);
    setEditForm({
      fullName: "",
      email: "",
      mobileNumber: "",
      bio: "",
      role: "",
      gender: "",
      startingYearOfTraveling: "",
      favoriteDestination: "",
      favoriteActivity: "",
      totalCountries: "",
      isDisabled: false,
      isYoutubeVerified: false,
      notificationsEnabled: false,
      travelPreference: "",
      destinationPreference: "",
      instagram: "",
      twitter: "",
      facebook: "",
      linkedin: "",
      youtube: "",
      latitude: "",
      longitude: "",
      subscription: "",
      coins: "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nomads</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search nomads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading nomads...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {nomads.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg">No nomads found</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nomad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mobile
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Countries
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {nomads.map((nomad) => (
                        <tr key={nomad._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {nomad.profilePic && (
                                <Image
                                  src={nomad.profilePic}
                                  alt={nomad.fullName}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-full mr-3"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {nomad.fullName}
                                </div>
                                {nomad.bio && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {nomad.bio.substring(0, 50)}...
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{nomad.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {nomad.mobileNumber || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                              {nomad.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                nomad.isDisabled
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {nomad.isDisabled ? "Disabled" : "Active"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {nomad.totalCountries || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Button
                                size="small"
                                onClick={() => handleView(nomad._id)}
                                style={{ color: "#722ed1", borderColor: "#722ed1" }}
                              >
                                View
                              </Button>
                              {isAdmin && (
                                <>
                                  <Button
                                    type="primary"
                                    size="small"
                                    onClick={() => handleEdit(nomad)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    danger
                                    size="small"
                                    onClick={() =>
                                      handleDelete(nomad._id, nomad.fullName)
                                    }
                                  >
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-200">
                  {nomads.map((nomad) => (
                    <div key={nomad._id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center flex-1">
                          {nomad.profilePic && (
                            <Image
                              src={nomad.profilePic}
                              alt={nomad.fullName}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-full mr-3"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">
                              {nomad.fullName}
                            </h3>
                            <p className="text-xs text-gray-500">{nomad.email}</p>
                          </div>
                        </div>
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded ${
                            nomad.isDisabled
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {nomad.isDisabled ? "Disabled" : "Active"}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center text-xs text-gray-600">
                          <span className="font-medium mr-2">Mobile:</span>
                          {nomad.mobileNumber || "N/A"}
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <span className="font-medium mr-2">Role:</span>
                          <span className="capitalize">{nomad.role}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <span className="font-medium mr-2">Countries:</span>
                          {nomad.totalCountries || 0}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleView(nomad._id)}
                          className="flex-1 px-3 py-2 text-xs font-medium text-purple-700 bg-purple-50 rounded hover:bg-purple-100"
                        >
                          View
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEdit(nomad)}
                              className="flex-1 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(nomad._id, nomad.fullName)
                              }
                              className="flex-1 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
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
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      <Modal
        open={!!viewingNomad}
        onCancel={() => setViewingNomad(null)}
        footer={null}
        width={800}
        title={
          <div className="text-xl font-bold">{viewingNomad?.fullName}</div>
        }
      >
        {viewingNomad && (
          <div className="space-y-6">
            {/* Profile Images */}
            <div className="flex gap-4">
              {viewingNomad.profilePic && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Profile Picture</h3>
                  <Image
                    src={viewingNomad.profilePic}
                    alt={viewingNomad.fullName}
                    width={150}
                    height={150}
                    className="rounded-full"
                  />
                </div>
              )}
              {viewingNomad.coverImage && (
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-700 mb-2">Cover Image</h3>
                  <Image
                    src={viewingNomad.coverImage}
                    alt="Cover"
                    className="rounded-lg"
                    style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}
                  />
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 text-lg">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-gray-900 font-medium">{viewingNomad.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{viewingNomad.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile Number</p>
                  <p className="text-gray-900">{viewingNomad.mobileNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-gray-900 capitalize">{viewingNomad.gender || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                    {viewingNomad.role}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      viewingNomad.isDisabled
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {viewingNomad.isDisabled ? "Disabled" : "Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {viewingNomad.bio && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Bio</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{viewingNomad.bio}</p>
              </div>
            )}

            {/* Travel Information */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 text-lg">Travel Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Countries</p>
                  <p className="text-gray-900 font-medium text-lg">
                    {viewingNomad.totalCountries || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Starting Year</p>
                  <p className="text-gray-900">
                    {viewingNomad.startingYearOfTraveling || "N/A"}
                  </p>
                </div>
                {viewingNomad.favoriteDestination && (
                  <div>
                    <p className="text-sm text-gray-500">Favorite Destination</p>
                    <p className="text-gray-900">
                      {viewingNomad.favoriteDestination}
                    </p>
                  </div>
                )}
                {viewingNomad.favoriteActivity &&
                  viewingNomad.favoriteActivity.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Favorite Activities</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {viewingNomad.favoriteActivity.map((activity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded"
                          >
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                {viewingNomad.travelPreference &&
                  viewingNomad.travelPreference.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Travel Preference</p>
                      <div className="flex flex-wrap gap-2">
                        {viewingNomad.travelPreference.map((pref, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                {viewingNomad.destinationPreference &&
                  viewingNomad.destinationPreference.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">
                        Destination Preference
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {viewingNomad.destinationPreference.map((pref, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded"
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                {viewingNomad.destinationCovered &&
                  viewingNomad.destinationCovered.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-2">
                        Destinations Covered
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {viewingNomad.destinationCovered.map(
                          (destination, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                            >
                              {destination}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Social Media */}
            {viewingNomad.socialMedia && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 text-lg">Social Media</h3>
                <div className="grid grid-cols-2 gap-4">
                  {viewingNomad.socialMedia.instagram && (
                    <div>
                      <p className="text-sm text-gray-500">Instagram</p>
                      <a
                        href={viewingNomad.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {viewingNomad.socialMedia.instagram}
                      </a>
                    </div>
                  )}
                  {viewingNomad.socialMedia.youtube && (
                    <div>
                      <p className="text-sm text-gray-500">YouTube</p>
                      <a
                        href={viewingNomad.socialMedia.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {viewingNomad.socialMedia.youtube}
                      </a>
                    </div>
                  )}
                  {viewingNomad.socialMedia.facebook && (
                    <div>
                      <p className="text-sm text-gray-500">Facebook</p>
                      <a
                        href={viewingNomad.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {viewingNomad.socialMedia.facebook}
                      </a>
                    </div>
                  )}
                  {viewingNomad.socialMedia.twitter && (
                    <div>
                      <p className="text-sm text-gray-500">Twitter</p>
                      <a
                        href={viewingNomad.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {viewingNomad.socialMedia.twitter}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {viewingNomad.coordinates && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
                <p className="text-gray-600">
                  Latitude: {viewingNomad.coordinates.latitude || "N/A"}, Longitude: {viewingNomad.coordinates.longitude || "N/A"}
                </p>
              </div>
            )}

            {/* Account Info */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="text-gray-900 font-mono text-xs break-all">{viewingNomad._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-gray-900">
                    {new Date(viewingNomad.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Notifications Enabled</p>
                  <p className="text-gray-900">
                    {viewingNomad.notificationsEnabled ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">YouTube Verified</p>
                  <p className="text-gray-900">
                    {viewingNomad.isYoutubeVerified ? "Yes" : "No"}
                  </p>
                </div>
                {typeof viewingNomad.coins === "number" && (
                  <div>
                    <p className="text-sm text-gray-500">Coins</p>
                    <p className="text-gray-900">{viewingNomad.coins}</p>
                  </div>
                )}
                {viewingNomad.subscription && (
                  <div>
                    <p className="text-sm text-gray-500">Subscription ID</p>
                    <p className="text-xs text-gray-900 break-all">
                      {viewingNomad.subscription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      {editingNomad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Edit Nomad</h2>
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
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={editForm.mobileNumber}
                    onChange={(e) =>
                      setEditForm({ ...editForm, mobileNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    rows={3}
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
                    <option value="nomad">Nomad</option>
                    <option value="explorer">Explorer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Gender
                    </label>
                    <input
                      type="text"
                      value={editForm.gender}
                      onChange={(e) =>
                        setEditForm({ ...editForm, gender: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Starting Year of Traveling
                    </label>
                    <input
                      type="text"
                      value={editForm.startingYearOfTraveling}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          startingYearOfTraveling: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Favorite Destination
                    </label>
                    <input
                      type="text"
                      value={editForm.favoriteDestination}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          favoriteDestination: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={editForm.latitude}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          latitude: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={editForm.longitude}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          longitude: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={editForm.instagram}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          instagram: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={editForm.twitter}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          twitter: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={editForm.facebook}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          facebook: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      value={editForm.linkedin}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          linkedin: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      YouTube
                    </label>
                    <input
                      type="text"
                      value={editForm.youtube}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          youtube: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={editForm.isDisabled}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          isDisabled: e.target.checked,
                        })
                      }
                    />
                    Disabled
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

export default function NomadsPage() {
  return (
    <ProtectedRoute requireAdmin={false}>
      <Nomads />
    </ProtectedRoute>
  );
}
