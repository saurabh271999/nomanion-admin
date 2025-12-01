"use client";

import { useState, useEffect } from "react";
import { itineraryAPI } from "../../api";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Modal, Input, Button, Select, Image, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";

const { TextArea } = Input;

interface MediaItem {
  url: string;
  type?: string;
  caption?: string;
  _id?: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface BudgetBreakdown {
  accommodation?: number;
  food?: number;
  transport?: number;
  miscellaneous?: number;
}

interface Budget {
  breakdown?: BudgetBreakdown;
  total?: number;
  currency?: string;
  budgetType?: string;
}

interface PlaceLike {
  _id?: string;
  name: string;
  description?: string;
  coordinates?: Coordinates;
}

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
  updatedAt?: string;
  duration?: number;
  startDate?: string;
  endDate?: string;
  coordinates?: Coordinates;
  budget?: Budget;
  media?: MediaItem[];
  goodPlaces?: PlaceLike[];
  badPlaces?: PlaceLike[];
  mechanics?: PlaceLike[];
  hotels?: PlaceLike[];
  tags?: string[];
  views?: number;
  popularityScore?: number;
  averageRating?: number;
  totalReviews?: number;
  isDisabled?: boolean;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
    profilePic?: string;
    bio?: string;
  };
}

function Itineraries() {
  const [activeTab, setActiveTab] = useState<"published" | "drafts">("drafts");
  const [publishedItineraries, setPublishedItineraries] = useState<Itinerary[]>([]);
  const [draftItineraries, setDraftItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftTotal, setDraftTotal] = useState(0);
  const [publishedTotal, setPublishedTotal] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [viewingItinerary, setViewingItinerary] = useState<Itinerary | null>(null);
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null);
  const [editMedia, setEditMedia] = useState<MediaItem[]>([]);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    country: "",
    state: "",
    city: "",
    travelType: "",
    latitude: "",
    longitude: "",
    budgetAccommodation: "",
    budgetFood: "",
    budgetTransport: "",
    budgetMisc: "",
    budgetTotal: "",
    budgetCurrency: "",
    budgetType: "",
    duration: "",
    startDate: "",
    endDate: "",
    tags: "",
    views: "",
    popularityScore: "",
    averageRating: "",
    totalReviews: "",
    isPublished: false,
    isDisabled: false,
  });

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching itineraries...", {
        activeTab,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (activeTab === "published") {
        const response = (await itineraryAPI.getPublished({
          page: pagination.page,
          limit: pagination.limit,
        })) as any;
        console.log("📦 Published itineraries response:", response);
        const data = response.data || [];
        const paginationData = response.pagination || {};

        setPublishedItineraries(data);
        setPagination((prev) => ({
          ...prev,
          ...paginationData,
        }));

        // Prefer server total, otherwise fall back to count or current page length
        const total =
          paginationData.total ??
          response.count ??
          (Array.isArray(data) ? data.length : 0);
        setPublishedTotal(total);
      } else {
        const response = (await itineraryAPI.getDrafts({
          page: pagination.page,
          limit: pagination.limit,
        })) as any;
        console.log("📦 Draft itineraries response:", response);
        const data = response.data || [];
        const paginationData = response.pagination || {};

        setDraftItineraries(data);
        setPagination((prev) => ({
          ...prev,
          ...paginationData,
        }));

        const total =
          paginationData.total ??
          response.count ??
          (Array.isArray(data) ? data.length : 0);
        setDraftTotal(total);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch itineraries";
      setError(errorMessage);
      console.error("❌ Error fetching itineraries:", {
        error: err,
        message: errorMessage,
        stack: err.stack,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, pagination.page, pagination.limit]);

  const handlePublish = async (id: string) => {
    Modal.confirm({
      title: "Publish Itinerary",
      content: "Are you sure you want to publish this itinerary?",
      onOk: async () => {
        try {
          await itineraryAPI.publish(id);
          message.success("Itinerary published successfully!");
          fetchItineraries();
        } catch (err: any) {
          message.error(err.message || "Failed to publish itinerary");
        }
      },
    });
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Delete Itinerary",
      content: "Are you sure you want to delete this itinerary? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await itineraryAPI.delete(id);
          message.success("Itinerary deleted successfully!");
          fetchItineraries();
        } catch (err: any) {
          message.error(err.message || "Failed to delete itinerary");
        }
      },
    });
  };

  const handleView = async (id: string) => {
    try {
      const response = await itineraryAPI.getById(id);
      setViewingItinerary(response.data);
    } catch (err: any) {
      message.error(err.message || "Failed to fetch itinerary details");
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await itineraryAPI.getById(id);
      const itinerary = response.data;
      setEditingItinerary(itinerary);
      setEditMedia(itinerary.media || []);
      setEditForm({
        title: itinerary.title || "",
        description: itinerary.description || "",
        country: itinerary.country || "",
        state: itinerary.state || "",
        city: itinerary.city || "",
        travelType: itinerary.travelType || "",
        latitude:
          typeof itinerary.coordinates?.latitude === "number"
            ? String(itinerary.coordinates.latitude)
            : "",
        longitude:
          typeof itinerary.coordinates?.longitude === "number"
            ? String(itinerary.coordinates.longitude)
            : "",
        budgetAccommodation:
          itinerary.budget?.breakdown?.accommodation !== undefined
            ? String(itinerary.budget.breakdown.accommodation)
            : "",
        budgetFood:
          itinerary.budget?.breakdown?.food !== undefined
            ? String(itinerary.budget.breakdown.food)
            : "",
        budgetTransport:
          itinerary.budget?.breakdown?.transport !== undefined
            ? String(itinerary.budget.breakdown.transport)
            : "",
        budgetMisc:
          itinerary.budget?.breakdown?.miscellaneous !== undefined
            ? String(itinerary.budget.breakdown.miscellaneous)
            : "",
        budgetTotal:
          itinerary.budget?.total !== undefined
            ? String(itinerary.budget.total)
            : "",
        budgetCurrency: itinerary.budget?.currency || "",
        budgetType: itinerary.budget?.budgetType || "",
        duration:
          itinerary.duration !== undefined ? String(itinerary.duration) : "",
        startDate: itinerary.startDate
          ? itinerary.startDate.substring(0, 10)
          : "",
        endDate: itinerary.endDate ? itinerary.endDate.substring(0, 10) : "",
        tags:
          itinerary.tags && itinerary.tags.length > 0
            ? itinerary.tags.join(", ")
            : "",
        views:
          itinerary.views !== undefined ? String(itinerary.views) : "",
        popularityScore:
          itinerary.popularityScore !== undefined
            ? String(itinerary.popularityScore)
            : "",
        averageRating:
          itinerary.averageRating !== undefined
            ? String(itinerary.averageRating)
            : "",
        totalReviews:
          itinerary.totalReviews !== undefined
            ? String(itinerary.totalReviews)
            : "",
        isPublished: itinerary.isPublished ?? false,
        isDisabled: itinerary.isDisabled ?? false,
      });
    } catch (err: any) {
      message.error(err.message || "Failed to fetch itinerary details");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItinerary) return;

    try {
      const normalize = (value: string) => {
        const trimmed = value.trim();
        return trimmed || undefined;
      };

      const toNumber = (value: string) => {
        const norm = normalize(value);
        return norm !== undefined ? Number(norm) : undefined;
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

      const breakdown: BudgetBreakdown = {};
      const acc = toNumber(editForm.budgetAccommodation);
      const food = toNumber(editForm.budgetFood);
      const transport = toNumber(editForm.budgetTransport);
      const misc = toNumber(editForm.budgetMisc);
      if (acc !== undefined) breakdown.accommodation = acc;
      if (food !== undefined) breakdown.food = food;
      if (transport !== undefined) breakdown.transport = transport;
      if (misc !== undefined) breakdown.miscellaneous = misc;

      const budget: Budget = {};
      if (Object.keys(breakdown).length > 0) {
        budget.breakdown = breakdown;
      }
      const total = toNumber(editForm.budgetTotal);
      if (total !== undefined) {
        budget.total = total;
      }
      const currency = normalize(editForm.budgetCurrency);
      if (currency) budget.currency = currency;
      const budgetType = normalize(editForm.budgetType);
      if (budgetType) budget.budgetType = budgetType;

      const coordinatesPresent = normalize(editForm.latitude) &&
        normalize(editForm.longitude);

      const payload: any = {
        title: normalize(editForm.title),
        description: normalize(editForm.description),
        country: normalize(editForm.country),
        state: normalize(editForm.state),
        city: normalize(editForm.city),
        travelType: normalize(editForm.travelType),
        duration: toNumber(editForm.duration),
        startDate: normalize(editForm.startDate),
        endDate: normalize(editForm.endDate),
        tags: toArray(editForm.tags),
        views: toNumber(editForm.views),
        popularityScore: toNumber(editForm.popularityScore),
        averageRating: toNumber(editForm.averageRating),
        totalReviews: toNumber(editForm.totalReviews),
        isPublished: editForm.isPublished,
        isDisabled: editForm.isDisabled,
      };

      if (Object.keys(budget).length > 0) {
        payload.budget = budget;
      }

      if (coordinatesPresent) {
        payload.coordinates = {
          latitude: Number(editForm.latitude),
          longitude: Number(editForm.longitude),
        };
      }

      // attach media array (images) as-is, ignoring searchKeywords
      if (editMedia && editMedia.length) {
        payload.media = editMedia;
      }

      await itineraryAPI.update(editingItinerary._id, payload);
      message.success("Itinerary updated successfully!");
      setEditingItinerary(null);
      fetchItineraries();
    } catch (err: any) {
      message.error(err.message || "Failed to update itinerary");
    }
  };

  const handleCancelEdit = () => {
    setEditingItinerary(null);
    setEditMedia([]);
    setEditForm({
      title: "",
      description: "",
      country: "",
      state: "",
      city: "",
      travelType: "",
      latitude: "",
      longitude: "",
      budgetAccommodation: "",
      budgetFood: "",
      budgetTransport: "",
      budgetMisc: "",
      budgetTotal: "",
      budgetCurrency: "",
      budgetType: "",
      duration: "",
      startDate: "",
      endDate: "",
      tags: "",
      views: "",
      popularityScore: "",
      averageRating: "",
      totalReviews: "",
      isPublished: false,
      isDisabled: false,
    });
  };

  const currentItineraries = activeTab === "published" ? publishedItineraries : draftItineraries;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Itineraries</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review, edit, and manage all draft and published itineraries in one place.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="inline-flex rounded-xl bg-gray-100 p-1 text-sm">
          <button
            onClick={() => {
              setActiveTab("drafts");
              setPagination({ ...pagination, page: 1 });
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "drafts"
                ? "bg-white text-blue-600 shadow-sm"
                : "bg-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Drafts ({draftTotal})
          </button>
          <button
            onClick={() => {
              setActiveTab("published");
              setPagination({ ...pagination, page: 1 });
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "published"
                ? "bg-white text-blue-600 shadow-sm"
                : "bg-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Published ({publishedTotal})
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading itineraries...</p>
        </div>
      ) : (
        <>
          {/* Itineraries List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            {currentItineraries.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg">No {activeTab} itineraries found</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/5">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/5">
                          Nomad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/6">
                          User / Itinerary ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                          Created On
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItineraries.map((itinerary) => (
                        <tr key={itinerary._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {itinerary.title}
                            </div>
                            <div className="mt-1 text-xs text-gray-500 line-clamp-2 max-w-xs">
                              {itinerary.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {itinerary.city || "N/A"}, {itinerary.state || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">{itinerary.country}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {itinerary.createdBy?.profilePic && (
                                <img
                                  src={itinerary.createdBy.profilePic}
                                  alt={itinerary.createdBy.fullName}
                                  className="h-8 w-8 rounded-full mr-2"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {itinerary.createdBy?.fullName || "Unknown"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {itinerary.createdBy?.email || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-[11px] text-gray-900 font-mono break-all max-w-xs">
                              {itinerary.createdBy?._id || itinerary._id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(itinerary.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {!itinerary.isPublished && (
                                <button
                                  onClick={() => handlePublish(itinerary._id)}
                                  className="text-green-600 hover:text-green-900 px-3 py-1 rounded bg-green-50 hover:bg-green-100 text-xs"
                                >
                                  Publish
                                </button>
                              )}
                              <button
                                onClick={() => handleView(itinerary._id)}
                                className="text-purple-600 hover:text-purple-900 px-3 py-1 rounded bg-purple-50 hover:bg-purple-100 text-xs"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(itinerary._id)}
                                className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded bg-blue-50 hover:bg-blue-100 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(itinerary._id)}
                                className="text-red-600 hover:text-red-900 px-3 py-1 rounded bg-red-50 hover:bg-red-100 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-200">
                  {currentItineraries.map((itinerary) => (
                    <div key={itinerary._id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">
                            {itinerary.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {itinerary.description?.substring(0, 100)}...
                          </p>
                        </div>
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded ${
                            itinerary.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {itinerary.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center text-xs text-gray-600">
                          <span className="font-medium mr-2">Location:</span>
                          {itinerary.city || "N/A"}, {itinerary.state || "N/A"}, {itinerary.country}
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <span className="font-medium mr-2">Nomad:</span>
                          {itinerary.createdBy?.fullName || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium mr-2">User ID:</span>
                          <span className="font-mono break-all">
                            {itinerary.createdBy?._id || itinerary._id}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium mr-2">Created:</span>
                          {new Date(itinerary.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!itinerary.isPublished && (
                          <Button
                            type="primary"
                            size="small"
                            block
                            onClick={() => handlePublish(itinerary._id)}
                            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                          >
                            Publish
                          </Button>
                        )}
                        <Button
                          size="small"
                          block
                          onClick={() => handleView(itinerary._id)}
                          style={{ color: "#722ed1", borderColor: "#722ed1" }}
                        >
                          View
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          block
                          onClick={() => handleEdit(itinerary._id)}
                        >
                          Edit
                        </Button>
                        <Button
                          danger
                          size="small"
                          block
                          onClick={() => handleDelete(itinerary._id)}
                        >
                          Delete
                        </Button>
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
                <Button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      <Modal
        open={!!viewingItinerary}
        onCancel={() => setViewingItinerary(null)}
        footer={null}
        width={1000}
        title={
          <div className="text-xl font-bold">{viewingItinerary?.title}</div>
        }
      >
        {viewingItinerary && (
          <div className="space-y-6">
            {/* Media Gallery */}
            {viewingItinerary.media && viewingItinerary.media.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 text-lg">Photos & Videos</h3>
                <Image.PreviewGroup>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {viewingItinerary.media.map((item, index) => {
                      const mediaUrl = typeof item === "string" ? item : item.url;
                      const mediaType = typeof item === "object" ? item.type : "image";
                      
                      return (
                        <div key={index} className="relative">
                          {mediaType === "video" ? (
                            <video
                              src={mediaUrl}
                              controls
                              className="w-full h-48 object-cover rounded-lg"
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <Image
                              src={mediaUrl}
                              alt={`Media ${index + 1}`}
                              className="rounded-lg"
                              style={{ width: "100%", height: "200px", objectFit: "cover" }}
                            />
                          )}
                          {typeof item === "object" && item.caption && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {item.caption}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {viewingItinerary.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
                <p className="text-gray-600">
                  {viewingItinerary.city || "N/A"},{" "}
                  {viewingItinerary.state || "N/A"},{" "}
                  {viewingItinerary.country}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Travel Type
                </h3>
                <p className="text-gray-600 capitalize">
                  {viewingItinerary.travelType || "N/A"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Coordinates
                </h3>
                <p className="text-gray-600">
                  Lat:{" "}
                  {viewingItinerary.coordinates?.latitude ?? "N/A"},{" "}
                  Lng:{" "}
                  {viewingItinerary.coordinates?.longitude ?? "N/A"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Duration & Dates
                </h3>
                <p className="text-gray-600">
                  Days: {viewingItinerary.duration ?? "N/A"}
                </p>
                <p className="text-gray-600">
                  Start:{" "}
                  {viewingItinerary.startDate
                    ? new Date(
                        viewingItinerary.startDate
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="text-gray-600">
                  End:{" "}
                  {viewingItinerary.endDate
                    ? new Date(
                        viewingItinerary.endDate
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Budget */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Budget</h3>
              {viewingItinerary.budget ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
                  <div className="p-3 rounded border border-gray-200">
                    <p className="font-medium">Accommodation</p>
                    <p>
                      {viewingItinerary.budget.breakdown
                        ?.accommodation ?? 0}
                    </p>
                  </div>
                  <div className="p-3 rounded border border-gray-200">
                    <p className="font-medium">Food</p>
                    <p>{viewingItinerary.budget.breakdown?.food ?? 0}</p>
                  </div>
                  <div className="p-3 rounded border border-gray-200">
                    <p className="font-medium">Transport</p>
                    <p>
                      {viewingItinerary.budget.breakdown?.transport ?? 0}
                    </p>
                  </div>
                  <div className="p-3 rounded border border-gray-200">
                    <p className="font-medium">Miscellaneous</p>
                    <p>
                      {viewingItinerary.budget.breakdown
                        ?.miscellaneous ?? 0}
                    </p>
                  </div>
                  <div className="p-3 rounded border border-gray-200">
                    <p className="font-medium">Total</p>
                    <p>{viewingItinerary.budget.total ?? 0}</p>
                  </div>
                  <div className="p-3 rounded border border-gray-200">
                    <p className="font-medium">Currency / Type</p>
                    <p>
                      {viewingItinerary.budget.currency || "N/A"}{" "}
                      ({viewingItinerary.budget.budgetType || "N/A"})
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">N/A</p>
              )}
            </div>

            {/* Good Places */}
            {viewingItinerary.goodPlaces &&
              viewingItinerary.goodPlaces.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Good Places
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    {viewingItinerary.goodPlaces.map((place) => (
                      <div
                        key={place._id}
                        className="p-3 rounded border border-gray-200"
                      >
                        <p className="font-medium">{place.name}</p>
                        {place.description && (
                          <p className="text-gray-600 text-xs mt-1">
                            {place.description}
                          </p>
                        )}
                        {place.coordinates && (
                          <p className="text-xs text-gray-500 mt-1">
                            Lat: {place.coordinates.latitude ?? "N/A"},{" "}
                            Lng: {place.coordinates.longitude ?? "N/A"}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Stats */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
                <div>
                  <p className="text-gray-500">Views</p>
                  <p className="text-gray-900">
                    {viewingItinerary.views ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Popularity Score</p>
                  <p className="text-gray-900">
                    {viewingItinerary.popularityScore ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Average Rating</p>
                  <p className="text-gray-900">
                    {viewingItinerary.averageRating ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total Reviews</p>
                  <p className="text-gray-900">
                    {viewingItinerary.totalReviews ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Published</p>
                  <p className="text-gray-900">
                    {viewingItinerary.isPublished ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Disabled</p>
                  <p className="text-gray-900">
                    {viewingItinerary.isDisabled ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {viewingItinerary.tags && viewingItinerary.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {viewingItinerary.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Created By */}
            {viewingItinerary.createdBy && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Created By
                </h3>
                <div className="flex items-center">
                  {viewingItinerary.createdBy.profilePic && (
                    <Image
                      src={viewingItinerary.createdBy.profilePic}
                      alt={viewingItinerary.createdBy.fullName}
                      width={40}
                      height={40}
                      className="rounded-full mr-3"
                    />
                  )}
                  <div>
                    <p className="text-gray-900 font-medium">
                      {viewingItinerary.createdBy.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {viewingItinerary.createdBy.email}
                    </p>
                    {viewingItinerary.createdBy.bio && (
                      <p className="text-xs text-gray-500 mt-1">
                        {viewingItinerary.createdBy.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editingItinerary}
        onCancel={handleCancelEdit}
        onOk={handleSaveEdit}
        title="Edit Itinerary"
        width={800}
        okText="Save"
        cancelText="Cancel"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Title
            </label>
            <Input
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              placeholder="Enter itinerary title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Description
            </label>
            <TextArea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              rows={5}
              placeholder="Enter itinerary description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Country
              </label>
              <Input
                value={editForm.country}
                onChange={(e) =>
                  setEditForm({ ...editForm, country: e.target.value })
                }
                placeholder="Enter country"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                State
              </label>
              <Input
                value={editForm.state}
                onChange={(e) =>
                  setEditForm({ ...editForm, state: e.target.value })
                }
                placeholder="Enter state"
              />
            </div>
          </div>
          {/* Media editor */}
          {editingItinerary && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Images
                </span>
                <Button
                  size="small"
                  onClick={() =>
                    setEditMedia((prev) => [
                      ...prev,
                      { url: "", type: "image", caption: "" },
                    ])
                  }
                >
                  + Add Image
                </Button>
              </div>
              {editMedia.length === 0 ? (
                <p className="text-sm text-gray-500">No images added.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {editMedia.map((media, index) => (
                    <div
                      key={media._id || index}
                      className="flex items-start gap-3 rounded border border-gray-200 p-3"
                    >
                      <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                        {media.url ? (
                          <img
                            src={media.url}
                            alt={media.caption || `Image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )
                        }
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-1">
                            Image URL
                          </label>
                          <Input
                            size="small"
                            value={media.url}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditMedia((prev) => {
                                const next = [...prev];
                                next[index] = { ...next[index], url: value };
                                return next;
                              });
                            }}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-1">
                            Caption (optional)
                          </label>
                          <Input
                            size="small"
                            value={media.caption || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditMedia((prev) => {
                                const next = [...prev];
                                next[index] = { ...next[index], caption: value };
                                return next;
                              });
                            }}
                            placeholder="Short description of this image"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setEditMedia((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="mt-1 text-gray-400 hover:text-red-500"
                        aria-label="Remove image"
                      >
                        <CloseOutlined />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                City
              </label>
              <Input
                value={editForm.city}
                onChange={(e) =>
                  setEditForm({ ...editForm, city: e.target.value })
                }
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Travel Type
              </label>
              <Select
                value={editForm.travelType}
                onChange={(value) =>
                  setEditForm({ ...editForm, travelType: value })
                }
                placeholder="Select travel type"
                style={{ width: "100%" }}
              >
                <Select.Option value="solo">Solo</Select.Option>
                <Select.Option value="group">Group</Select.Option>
                <Select.Option value="couple">Couple</Select.Option>
                <Select.Option value="family">Family</Select.Option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Latitude
              </label>
              <Input
                value={editForm.latitude}
                onChange={(e) =>
                  setEditForm({ ...editForm, latitude: e.target.value })
                }
                placeholder="Latitude"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Longitude
              </label>
              <Input
                value={editForm.longitude}
                onChange={(e) =>
                  setEditForm({ ...editForm, longitude: e.target.value })
                }
                placeholder="Longitude"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Accommodation Budget
              </label>
              <Input
                type="number"
                value={editForm.budgetAccommodation}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    budgetAccommodation: e.target.value,
                  })
                }
                placeholder="Accommodation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Food Budget
              </label>
              <Input
                type="number"
                value={editForm.budgetFood}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    budgetFood: e.target.value,
                  })
                }
                placeholder="Food"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Transport Budget
              </label>
              <Input
                type="number"
                value={editForm.budgetTransport}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    budgetTransport: e.target.value,
                  })
                }
                placeholder="Transport"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Misc Budget
              </label>
              <Input
                type="number"
                value={editForm.budgetMisc}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    budgetMisc: e.target.value,
                  })
                }
                placeholder="Miscellaneous"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Total Budget
              </label>
              <Input
                type="number"
                value={editForm.budgetTotal}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    budgetTotal: e.target.value,
                  })
                }
                placeholder="Total"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Currency
              </label>
              <Input
                value={editForm.budgetCurrency}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    budgetCurrency: e.target.value,
                  })
                }
                placeholder="Currency (e.g. INR)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Budget Type
              </label>
              <Input
                value={editForm.budgetType}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    budgetType: e.target.value,
                  })
                }
                placeholder="e.g. budget / moderate / luxury"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Duration (days)
              </label>
              <Input
                type="number"
                value={editForm.duration}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    duration: e.target.value,
                  })
                }
                placeholder="Duration"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={editForm.startDate}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    startDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={editForm.endDate}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    endDate: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Tags (comma separated)
            </label>
            <Input
              value={editForm.tags}
              onChange={(e) =>
                setEditForm({ ...editForm, tags: e.target.value })
              }
              placeholder="tag1, tag2, tag3"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Views
              </label>
              <Input
                type="number"
                value={editForm.views}
                onChange={(e) =>
                  setEditForm({ ...editForm, views: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Popularity Score
              </label>
              <Input
                type="number"
                value={editForm.popularityScore}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    popularityScore: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Average Rating
              </label>
              <Input
                type="number"
                value={editForm.averageRating}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    averageRating: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Total Reviews
              </label>
              <Input
                type="number"
                value={editForm.totalReviews}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    totalReviews: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={editForm.isPublished}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    isPublished: e.target.checked,
                  })
                }
              />
              Published
            </label>
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
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function ItinerariesPage() {
  return (
    <ProtectedRoute>
      <Itineraries />
    </ProtectedRoute>
  );
}

