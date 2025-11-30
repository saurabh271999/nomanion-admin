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
  media?: MediaItem[];
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
    profilePic?: string;
  };
}

function Itineraries() {
  const [activeTab, setActiveTab] = useState<"published" | "drafts">("drafts");
  const [publishedItineraries, setPublishedItineraries] = useState<Itinerary[]>([]);
  const [draftItineraries, setDraftItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [viewingItinerary, setViewingItinerary] = useState<Itinerary | null>(null);
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    country: "",
    state: "",
    city: "",
    travelType: "",
  });

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching itineraries...", { activeTab, page: pagination.page, limit: pagination.limit });

      if (activeTab === "published") {
        const response = await itineraryAPI.getPublished({
          page: pagination.page,
          limit: pagination.limit,
        }) as any;
        console.log("📦 Published itineraries response:", response);
        setPublishedItineraries(response.data || []);
        setPagination(response.pagination || pagination);
      } else {
        const response = await itineraryAPI.getDrafts({
          page: pagination.page,
          limit: pagination.limit,
        }) as any;
        console.log("📦 Draft itineraries response:", response);
        setDraftItineraries(response.data || []);
        setPagination(response.pagination || pagination);
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
      setEditForm({
        title: itinerary.title || "",
        description: itinerary.description || "",
        country: itinerary.country || "",
        state: itinerary.state || "",
        city: itinerary.city || "",
        travelType: itinerary.travelType || "",
      });
    } catch (err: any) {
      message.error(err.message || "Failed to fetch itinerary details");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItinerary) return;

    try {
      await itineraryAPI.update(editingItinerary._id, editForm);
      message.success("Itinerary updated successfully!");
      setEditingItinerary(null);
      fetchItineraries();
    } catch (err: any) {
      message.error(err.message || "Failed to update itinerary");
    }
  };

  const handleCancelEdit = () => {
    setEditingItinerary(null);
    setEditForm({
      title: "",
      description: "",
      country: "",
      state: "",
      city: "",
      travelType: "",
    });
  };

  const currentItineraries = activeTab === "published" ? publishedItineraries : draftItineraries;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Itineraries</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setActiveTab("drafts");
              setPagination({ ...pagination, page: 1 });
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "drafts"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Drafts ({draftItineraries.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("published");
              setPagination({ ...pagination, page: 1 });
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "published"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Published ({publishedItineraries.length})
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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {currentItineraries.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg">No {activeTab} itineraries found</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nomad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {itinerary.description?.substring(0, 60)}...
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
                            <div className="text-sm text-gray-900 font-mono text-xs">
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
              <p className="text-gray-600 whitespace-pre-wrap">{viewingItinerary.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
                <p className="text-gray-600">
                  {viewingItinerary.city || "N/A"}, {viewingItinerary.state || "N/A"}, {viewingItinerary.country}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Travel Type</h3>
                <p className="text-gray-600 capitalize">{viewingItinerary.travelType}</p>
              </div>
            </div>

            {/* Created By */}
            {viewingItinerary.createdBy && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Created By</h3>
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

