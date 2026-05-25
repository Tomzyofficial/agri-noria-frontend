"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import SubmitButton from "../../../dashboard/components/SubmitButton";

export default function UploadMaterial() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !file) {
      toast.error("Please fill in all fields and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await fetch("/api/proxy/vendor/upload-material", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Material uploaded successfully!");
        router.push("/dashboard/trainings");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to upload material.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred while uploading.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-(--card-dark) rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Upload Training Material</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            required
          ></textarea>
        </div>

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700"
          >
            Upload File
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            required
          />
        </div>

        <div>
          <SubmitButton
            loading={loading}
            text="Upload Material"
            loadingText="Uploading..."
          />
          {/* <button
                  type="submit"
                  className="cursor-pointer w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  disabled={isUploading}
               >
                  {isUploading ? "Uploading..." : "Upload Material"}
               </button> */}
        </div>
      </form>
    </div>
  );
}
