import { z } from "zod";

const imageSchema = z
  .instanceof(File)
  .refine((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Only JPG, PNG or WEBP images are allowed")
  .refine((file) => file.size <= 10 * 1024 * 1024, "Image must not exceed 10MB");

export const createPortfolioSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  location: z.string().optional(),
  completion_date: z.string().min(1, { message: "Completion date is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  client_type: z.string().optional(),
  project_duration: z.string().optional(),
  budget_range: z.string().optional(),
  featured_image: imageSchema,
  gallery_images: z.array(imageSchema).max(5).optional(),
});
