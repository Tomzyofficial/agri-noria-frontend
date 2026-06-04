"use client";
import z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import SubmitButton from "../../../dashboard/components/SubmitButton";

const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  file: z
    .instanceof(File, {
      message: "File is required.",
    })
    .refine((file) => file.size > 0, "Please upload an actual file.")
    .refine(
      (file) =>
        [
          "image/jpeg",
          "image/png",
          "image/webp",
          "video/mp4",
          "video/mov",
          "video/webm",
          "application/pdf",
        ].includes(file.type),
      "Only JPG, PNG, or WEBP images or mp4, video/mov, video/webm video or pdf are allowed.",
    ),
  category: z.string().min(1, { message: "Category is required" }),
});

export default function UploadMaterial() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleInputChange = (e) => {
    const { type, value, name, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const schemaResult = schema.safeParse(formData);
      if (!schemaResult.success) {
        const fieldErrors = schemaResult.error.flatten().fieldErrors;
        const firstMsg = Object.values(fieldErrors).flat().filter(Boolean)[0];
        throw new Error(firstMsg);
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) =>
        formDataToSend.append(key, formData[key]),
      );

      setLoading(true);
      const response = await fetch("/api/proxy/vendor/upload-material", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success("Material uploaded successfully!");
        router.push("/marketplace/trainer");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload material.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "An error occurred while uploading.");
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-(--card-dark) rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Upload Training Material</h1>
      <form
        onSubmit={handleSubmit}
        aria-busy={loading}
        noValidate
        className="space-y-4"
      >
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
            name="title"
            autoComplete="on"
            disabled={loading}
            value={formData.title}
            onChange={handleInputChange}
            className="disabled:opacity-50 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <input
            type="text"
            id="category"
            autoComplete="on"
            name="category"
            disabled={loading}
            value={formData.category}
            onChange={handleInputChange}
            className="disabled:opacity-50 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
            name="description"
            value={formData.description}
            autoComplete="on"
            onChange={handleInputChange}
            disabled={loading}
            className="disabled:opacity-50 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
            name="file"
            onChange={handleInputChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            required
          />
        </div>

        <div>
          <SubmitButton
            loading={loading}
            text="Upload Material"
            loadingText="Please wait..."
          />
        </div>
      </form>
    </div>
  );
}
