"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Plus,
  Play,
  Users,
  Calendar,
  Clock,
  Edit,
  Trash2,
  BarChart3,
  BookOpen,
  Video,
  Live,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import useSWR from "swr";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import Image from "next/image";

export default function TrainingPartnerDashboard() {
  const [activeTab, setActiveTab] = useState("upcoming");

  const fetcher = async (url) => {
    const res = await fetch(url, {
      method: "GET",
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error("An error occurred.");
    }

    return data;
  };

  const {
    error: trainingsError,
    data: trainingsData,
    isLoading: trainingsLoading,
  } = useSWR("/api/proxy/vendor/training/list", fetcher);

  const {
    error: enrollmentError,
    data: enrollmentCount,
    isLoading: enrollmentLoading,
  } = useSWR(`/api/proxy/vendor/training/enrollments`, fetcher);

  const {
    error: trainingMaterialError,
    data: trainingMaterialData,
    isLoading: trainingMaterialLoading,
  } = useSWR("/api/proxy/vendor/materials", fetcher);

  // Check if training is ready to start or live
  const isEnrolled = (trainingId) => {
    return trainingsData?.enrollmentData?.some(
      (enrollment) => enrollment.training_id === trainingId,
    );
  };
  const getTrainingButtonState = (training) => {
    const enrolled = isEnrolled(training.id);

    const now = new Date();
    const scheduledTime = new Date(training.scheduled_at);
    const endTime = new Date(
      scheduledTime.getTime() + training.duration_minutes * 60000,
    );

    if (enrolled) {
      if (training.computed_status === "Live") {
        return {
          text: "Join Session",
          state: "live",
          disabled: false,
        };
      }

      if (training.computed_status === "Completed" || now >= endTime) {
        return {
          text: "Completed",
          state: "completed",
          disabled: true,
        };
      }

      return {
        text: "Enrolled",
        state: "enrolled",
        disabled: true,
      };
    }

    // NOT ENROLLED
    if (training.computed_status === "Completed" || now >= endTime) {
      return {
        text: "Ended",
        state: "ended",
        disabled: true,
      };
    }

    if (now >= scheduledTime) {
      return {
        text: "Too Late to Enroll",
        state: "late",
        disabled: true,
      };
    }

    return {
      text: "Enroll",
      state: "available",
      disabled: false,
    };
  };

  const handleEnrollment = (trainingId) => {
    fetch(`/api/proxy/vendor/training/${trainingId}/enroll`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("Enrolled in training successfully!");
          // Refresh the data to update button states
          window.location.reload();
        } else {
          console.log("error jear", data.error);
          toast.error("Failed to enroll in training.");
        }
      })
      .catch((error) => {
        console.error("Error enrolling in training:", error);
        toast.error("Failed to enroll in training.");
      });
  };

  const handleJoinSession = (trainingId) => {
    fetch(`/api/proxy/vendor/training/${trainingId}/join`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Store Agora session data and redirect to live session page
          localStorage.setItem(
            `agoraSession_${trainingId}`,
            JSON.stringify({
              token: data.data.agoraToken,
              channelName: data.data.channelName,
              appId: data.data.appId,
              trainingId: trainingId,
              isHost: false,
              uid: data.data.uid,
              trainingTitle: data.data.training?.title,
            }),
          );
          window.open(`/marketplace/training/live/${trainingId}`, "_blank");
        } else {
          toast.error(data.error || "Failed to join session");
        }
      })
      .catch((error) => {
        console.error("Error joining session:", error);
        toast.error("Failed to join session");
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  return (
    <div className="space-y-6 mb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Enrollment</h1>
          <p className="text-gray-600">
            Manage your agricultural training sessions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {enrollmentLoading ? (
          <CardSkeleton />
        ) : enrollmentError ? (
          <Card className="text-red-500 text-sm h-32 flex items-center justify-center">
            {enrollmentError.message}
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrollmentCount?.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Live</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "upcoming"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("materials")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "materials"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Training Materials
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "upcoming" && (
        <div className="space-y-4">
          {trainingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : trainingsError ? (
            <Card className="text-red-500 text-sm h-32 flex items-center justify-center">
              {trainingsError.message}
            </Card>
          ) : trainingsData?.trainingData?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainingsData?.trainingData?.map((training) => (
                <Card
                  key={training.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent>
                    <div>
                      {training.thumbnail ? (
                        <Image
                          width={500}
                          height={500}
                          src={training.thumbnail}
                          alt={training.title}
                          className="w-full h-44 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-1/2 h-1/2 bg-gray-200 rounded-full flex items-center justify-center">
                          <Play className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-2 space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-400">
                          {training.title}
                        </h3>
                        <Badge
                          className={`shrink-0 p-1 rounded-md text-sm ${getStatusColor(training.computed_status)}`}
                        >
                          {training.computed_status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-200 text-sm line-clamp-2">
                        {training.description}
                      </p>
                      <p className="text-gray-500 text-start text-sm">
                        Duration: {formatDuration(training.duration_minutes)}
                      </p>
                      <p className="text-gray-500 text-start text-sm">
                        Time: {formatDate(training.scheduled_at)}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <p>
                            By {training.trainer_fname} {training.trainer_lname}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            const buttonState =
                              getTrainingButtonState(training);
                            if (buttonState.state === "available") {
                              if (
                                confirm(
                                  "Are you sure you want to enroll in this training?",
                                )
                              ) {
                                handleEnrollment(training.id);
                              } else {
                                toast.info("Enrollment cancelled");
                              }
                            } else if (buttonState.state === "live") {
                              handleJoinSession(training.id);
                            }
                          }}
                          disabled={getTrainingButtonState(training).disabled}
                          className={`cursor-pointer p-1 rounded ${
                            getTrainingButtonState(training).state === "live"
                              ? "bg-red-500 hover:bg-red-600"
                              : getTrainingButtonState(training).state ===
                                  "available"
                                ? "bg-green-500 hover:bg-green-600"
                                : getTrainingButtonState(training).state ===
                                    "enrolled"
                                  ? "bg-blue-500"
                                  : getTrainingButtonState(training).state ===
                                      "Completed"
                                    ? "bg-gray-500"
                                    : "bg-gray-400"
                          } text-white`}
                        >
                          {getTrainingButtonState(training).text}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No trainings yet
                </h3>
                <p className="text-gray-500 mb-4">
                  There are no available training session right now.
                </p>
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
            <Card className="text-red-500 text-sm h-32 flex items-center justify-center">
              {trainingMaterialError.message}
            </Card>
          ) : trainingMaterialData?.data?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {trainingMaterialData.data.map((material) => {
                const fileType = material.file_type?.toLowerCase();
                const fileUrl = material.file_path;

                return (
                  <Card
                    key={material.id}
                    className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Media Preview */}
                    <div className="relative w-full h-60 bg-gray-100">
                      {/* IMAGE */}
                      {fileType?.includes("image") && (
                        <Image
                          src={fileUrl}
                          alt={material.title}
                          fill
                          className="object-cover"
                        />
                      )}

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

                          <p className="text-sm text-gray-600 px-4 text-center">
                            PDF Document
                          </p>

                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="mt-4"
                          >
                            <Button className="bg-red-600 hover:bg-red-700 text-white">
                              Download PDF
                            </Button>
                          </a>
                        </div>
                      )}

                      {/* FALLBACK */}
                      {!fileType?.includes("image") &&
                        !fileType?.includes("video") &&
                        !fileType?.includes("pdf") && (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            Unsupported File
                          </div>
                        )}
                    </div>

                    {/* Content */}
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                            {material.title}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1 capitalize">
                            {fileType}
                          </p>
                        </div>

                        <Badge className="bg-green-100 text-green-700 border border-green-200">
                          {material.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <p className="text-gray-600 text-sm mt-3 line-clamp-3">
                        {material.description || "No description available."}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No recorded videos
                </h3>
                <p className="text-gray-500 mb-4">
                  Upload your first video to create on-demand learning content.
                </p>
                <Link href="/dashboard/vendor/trainings/upload">
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
