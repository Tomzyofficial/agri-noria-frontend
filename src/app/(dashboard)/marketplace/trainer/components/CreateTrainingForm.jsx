"use client";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { toast } from "react-toastify";
import ImageUploadPreview from "../../../dashboard/components/ImageUploadPreview";
import SubmitButton from "../../../dashboard/components/SubmitButton";
import z from "zod";

const schemaValidationi = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  durationMinutes: z.number().min(1, "Duration is required"),
  scheduledAt: z.string().min(1, "Scheduled date is required"),
  maxParticipants: z.number().min(1, "Max participants is required"),
  thumbnail: z.instanceof(File).refine((file) => file.size > 0, "Thumbnail is required"),
});

export function CreateTrainingForm() {
  const [preview, setPreview] = useState();
  const [loading, setLoading] = useState();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    durationMinutes: "",
    scheduledAt: "",
    maxParticipants: "",
    thumbnail: "",
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, [name]: file }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }
    if (!formData.description) {
      toast.error("Description is required");
      return;
    }
    if (!formData.durationMinutes) {
      toast.error("Duration is required");
      return;
    }
    if (!formData.scheduledAt) {
      toast.error("Scheduled date is required");
      return;
    }
    if (!formData.maxParticipants) {
      toast.error("Max participants is required");
      return;
    }
    if (!formData.thumbnail) {
      toast.error("Thumbnail is required");
      return;
    }
    setLoading(true);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      const res = await fetch("/api/proxy/vendor/training/create", {
        method: "POST",
        body: formDataToSend,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to create training");
        console.error("Fetch not ok", res.status);
        return;
      }

      toast.success("Training created successfully!");
      // Reset form
      setFormData({
        title: "",
        description: "",
        durationMinutes: "",
        scheduledAt: "",
        maxParticipants: "",
        thumbnail: "",
      });
      setPreview(null);
    } catch (error) {
      toast.error("An error occurred while creating training");
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} aria-busy={loading} noValidate>
        <ImageUploadPreview text="Training Thumbnail" preview={preview} previewText="No Thumbnail" loading={loading} id="thumbnail" name="thumbnail" handleChange={handleChange} />

        <div className="grid md:grid-cols-2 gap-4 space-y-2 mt-5">
          <div>
            <Label htmlFor="title">Training Title</Label>
            <Input placeholder="E.g. How to grow tomatoes" value={formData.title} required id="title" name="title" onChange={handleChange} className={loading ? "cursor-not-allowed opacity-50" : ""} disabled={loading} />
          </div>
          <div>
            <Label htmlFor="description">Training Description</Label>
            <Input placeholder="E.g. Learn how to grow tomatoes in 4 weeks" id="description" name="description" onChange={handleChange} value={formData.description} required className={loading ? "cursor-not-allowed opacity-50" : ""} disabled={loading} />
          </div>
          <div>
            <Label htmlFor="durationMinutes">Training Duration</Label>
            <Input placeholder="E.g. 60 (in minutes)" id="durationMinutes" name="durationMinutes" onChange={handleChange} value={formData.durationMinutes} required className={loading ? "cursor-not-allowed opacity-50" : ""} disabled={loading} />
          </div>
          <div>
            <Label htmlFor="scheduledAt">Schedule Date</Label>
            <Input type="datetime-local" id="scheduledAt" required name="scheduledAt" onChange={handleChange} value={formData.scheduledAt} className={loading ? "cursor-not-allowed opacity-50" : ""} disabled={loading} />
          </div>
          <div>
            <Label htmlFor="maxparticipants">Max Participants</Label>
            <Input placeholder="E.g. 50" id="maxParticipants" value={formData.maxParticipants} required name="maxParticipants" onChange={handleChange} className={loading ? "cursor-not-allowed opacity-50" : ""} disabled={loading} />
          </div>
        </div>
        <div className="mt-4">
          <SubmitButton loading={loading} text="Create Training" loadingText="Creating..." />
        </div>
      </form>
    </div>
  );
}
