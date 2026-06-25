"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Play, Users, Edit, Trash2, BookOpen, Video } from "lucide-react";
import useSWR from "swr";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { fetcher } from "@/utils/otherUtils";
import { formatDate } from "@/utils/otherUtils";
import { StatCard } from "@/app/(dashboard)/dashboard/components/ui/StatCard";
import Link from "next/link";

export function TrainingPartnerDashboard() {
  const [activeTab, setActiveTab] = useState("trainings");
  const [activeSession, setActiveSession] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const { refresh } = useRouter();

  const { error: trainingsError, data: trainingsData, isLoading: trainingsLoading, mutate } = useSWR("/api/proxy/vendor/training/overview", fetcher);

  const { error: trainingMaterialError, data: trainingMaterialData, isLoading: trainingMaterialLoading } = useSWR("/api/proxy/vendor/vendor-materials", fetcher);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800";
      case "Live":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStartSession = async (event, trainingId) => {
    event.preventDefault();
    event.stopPropagation();
    setPendingAction(`start-${trainingId}`);
    try {
      const response = await fetch(`/api/proxy/vendor/training/${trainingId}/start`, {
        method: "POST",
      });
      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        // Store Agora session data and open live session
        localStorage.setItem(
          `agoraSession_${trainingId}`,
          JSON.stringify({
            token: data.data.agoraToken,
            channelName: data.data.channelName,
            appId: data.data.appId,
            trainingId,
            isHost: true,
            uid: data.data.uid,
            trainingTitle: data.data.training?.title,
          })
        );
        setActiveSession({
          trainingId,
          token: data.data.agoraToken,
          channelName: data.data.channelName,
          appId: data.data.appId,
          isHost: true,
        });
        window.open(`/marketplace/training/live/${trainingId}`, "_blank");
        toast.success("Training session started!");
      } else {
        toast.error(data.error || "Failed to start session");
      }
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Failed to start session");
    } finally {
      setPendingAction(null);
    }
  };

  const handleEndSession = async (event, trainingId) => {
    event.preventDefault();
    event.stopPropagation();
    if (confirm("Are you sure you want to end this training session?")) {
      try {
        setPendingAction(`end-${trainingId}`);
        const response = await fetch(`/api/proxy/vendor/training/${trainingId}/end`, {
          method: "POST",
        });
        const data = await response.json();

        if (data.success) {
          toast.success("Training session ended!");
          setActiveSession(null);
          // Refresh data by revalidating SWR
          refresh();
        } else {
          toast.error(data.error || "Failed to end session");
        }
      } catch (error) {
        console.error("Error ending session:", error);
        toast.error("Failed to end session");
      } finally {
        setPendingAction(null);
      }
    }
  };

  const handleDeleteTraining = async (event, trainingId) => {
    event.preventDefault();
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this training? This action cannot be undone.")) {
      try {
        setPendingAction(`delete-${trainingId}`);
        const response = await fetch(`/api/proxy/vendor/training/${trainingId}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (data.success) {
          toast.success("Training deleted successfully!");
          mutate();
        } else {
          toast.error(data.error || "Failed to delete training");
        }
      } catch (error) {
        console.error("Error deleting training:", error);
        toast.error("Failed to delete training");
      } finally {
        setPendingAction(null);
      }
    }
  };
  const handleDeleteTrainingMaterial = async (event, trainingId) => {
    event.preventDefault();
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this training material? This action cannot be undone.")) {
      try {
        setPendingAction(`delete-material-${trainingId}`);
        const response = await fetch(`/api/proxy/vendor/delete-material/${trainingId}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (data.success) {
          toast.success("Training material deleted successfully!");
          refresh();
        } else {
          toast.error(data.error || "Failed to delete training material");
        }
      } catch (error) {
        console.error("Error deleting training material:", error);
        toast.error("Failed to delete training material");
      } finally {
        setPendingAction(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Partner Dashboard</h1>
          <p className="text-gray-600">Manage your agricultural training programs for farmers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard isLoading={trainingsLoading} error={trainingsError} title="Total trainings" value={trainingsData?.total || 0} icon={BookOpen} />
        <StatCard isLoading={trainingsLoading} error={trainingsError} title="Total enrolled" value={trainingsData?.totalEnrolledFarmers || 0} icon={BookOpen} />
        <StatCard isLoading={trainingsLoading} error={trainingsError} title="Total Materials" value={trainingMaterialData?.data?.length || 0} icon={BookOpen} />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button onClick={() => setActiveTab("trainings")} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "trainings" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
            Trainings
          </button>
          <button onClick={() => setActiveTab("materials")} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "materials" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
            Training Materials
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "trainings" && (
        <div className="space-y-4">
          {trainingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : trainingsError ? (
            <Card className="text-red-500 text-sm h-32 flex items-center justify-center">{trainingsError.message}</Card>
          ) : trainingsData?.total > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainingsData?.data?.map((training) => (
                <Card key={training.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {training.thumbnail ? (
                      <Image width={500} height={500} src={training.thumbnail} alt={training.title} className="w-full h-44 object-cover rounded-t-lg" />
                    ) : (
                      <div className="w-full h-44 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <Play className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {Number(training["enrolled_count"]) || 0} {Number(training["enrolled_count"]) === 1 ? "Person" : "People"} out of {training.max_participants} enrolled
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{training.title}</h3>
                      <Badge className={`${getStatusColor(training.status)} shrink-0 p-1 rounded-md text-sm`}>{training.status}</Badge>
                    </div>
                    <p className="text-gray-600 text-start text-sm mb-2 line-clamp-2">{training.description}</p>
                    <p className="text-gray-600 text-start text-sm mb-4 line-clamp-2">Scheduled Date: {formatDate(training.scheduled_at)}</p>
                    <p className="text-gray-600 text-start text-sm mb-4 line-clamp-2">Duration: {formatDuration(training.duration_minutes)}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button className="cursor-pointer rounded p-1 bg-blue-500 hover:bg-blue-600 text-white flex items-center">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button type="button" disabled={pendingAction !== null} onClick={(event) => handleDeleteTraining(event, training.id)} className="disabled:opacity-50 cursor-pointer rounded p-1 bg-red-500 hover:bg-red-600 text-white flex items-center">
                          {pendingAction === `delete-${training.id}` ? <FaSpinner className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          Delete
                        </Button>
                      </div>
                      {training.status === "Upcoming" && (
                        <Button type="button" disabled={pendingAction !== null} onClick={(event) => handleStartSession(event, training.id)} className="cursor-pointer p-1 rounded bg-green-500 hover:bg-green-600 text-white">
                          {pendingAction === `start-${training.id}` ? "Starting..." : "Start Session"}
                        </Button>
                      )}
                      {training.status === "Live" && (
                        <Button type="button" disabled={pendingAction !== null} onClick={(event) => handleEndSession(event, training.id)} className="cursor-pointer p-1 rounded bg-red-500 hover:bg-red-600 text-white">
                          {pendingAction === `end-${training.id}` ? "Ending..." : "End Session"}
                        </Button>
                      )}
                      {training.status === "COMPLETED" && (
                        <Button disabled className="cursor-pointer p-1 rounded bg-gray-400 text-white">
                          Completed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trainings yet</h3>
                <p className="text-gray-500 mb-4">Create your first training program to get started.</p>
                <Link href="/marketplace/trainer/create-training" className="inline-flex gap-2 items-center bg-(--greenish-color) rounded-md p-2 text-white dark:text-gray-200 transition hover:bg-(--dark-green-color) hover:transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Training
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "materials" && (
        <div className="space-y-4">
          {trainingMaterialLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg p-3 mb-4">
                        <div className="h-6 w-6 bg-gray-300 rounded-full mx-auto" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4" />
                        <div className="h-4 bg-gray-300 rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : trainingMaterialError ? (
            <Card className="text-red-500 text-sm h-32 flex items-center justify-center">{trainingMaterialError.message}</Card>
          ) : trainingMaterialData?.data?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {trainingMaterialData.data.map((material) => {
                const fileType = material.file_type?.toLowerCase();
                const fileUrl = material.file_path;

                return (
                  <Card key={material.id} className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                    {/* Media Preview */}
                    <div className="relative w-full h-60 bg-gray-100">
                      {/* IMAGE */}
                      {fileType?.includes("image") && <Image src={fileUrl} alt={material.title} fill className="object-cover" />}

                      {/* VIDEO */}
                      {fileType?.includes("video") && (
                        <video controls className="w-full h-full object-cover">
                          <source src={fileUrl} type={material.file_type} />
                          Your browser does not support videos.
                        </video>
                      )}

                      {/* PDF */}
                      {fileType?.includes("pdf") && (
                        <div className="flex flex-col items-center justify-center h-full bg-red-50">
                          <div className="text-red-600 text-6xl mb-4">📄</div>

                          <p className="text-sm text-gray-600 px-4 text-center">PDF Document</p>

                          <Link href={fileUrl} target="_blank" rel="noopener noreferrer" download className="mt-4">
                            <Button className="bg-red-600 hover:bg-red-700 text-white">Download PDF</Button>
                          </Link>
                        </div>
                      )}

                      {/* FALLBACK */}
                      {!fileType?.includes("image") && !fileType?.includes("video") && !fileType?.includes("pdf") && <div className="flex items-center justify-center h-full text-gray-400">Unsupported File</div>}
                    </div>

                    {/* Content */}
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{material.title}</h3>

                          <p className="text-sm text-gray-500 mt-1 capitalize">{fileType}</p>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mt-3 line-clamp-3">{material.description || "No description available."}</p>

                      {/* Actions */}
                      <div className="flex justify-between mt-5">
                        <Button className="flex items-center bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>

                        <Button type="button" disabled={pendingAction !== null} onClick={(event) => handleDeleteTrainingMaterial(event, material.id)} className="cursor-pointer rounded flex items-center bg-red-500 hover:bg-red-600 text-white py-1 px-2">
                          {pendingAction === `delete-material-${material.id}` ? <FaSpinner className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recorded videos</h3>
                <p className="text-gray-500 mb-4">Upload your first video to create on-demand learning content.</p>
                <Link href="/marketplace/trainer/upload-material" className="inline-flex gap-2 items-center bg-(--greenish-color) rounded-md p-2 text-white dark:text-gray-200 transition hover:bg-(--dark-green-color) hover:transition-colors">
                  <Play className="h-4 w-4 mr-2" />
                  Upload Video
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
