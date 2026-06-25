import { z } from "zod";

const imageSchema = z
  .any()
  .refine((files) => files?.length > 0, "Featured image is required")
  .refine((files) => ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(files?.[0]?.type), "Only JPG, JPEG, PNG or WEBP images are allowed")
  .refine((files) => files?.[0]?.size <= 10 * 1024 * 1024, "Image must not exceed 10MB");

const gallery = z
  .any()
  .optional()
  .refine((files) => {
    if (!files?.length) return true;

    return Array.from(files).every((file) => ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type));
  }, "Only JPG, JPEG, PNG or WEBP images are allowed")
  .refine((files) => {
    if (!files?.length) return true;

    return Array.from(files).every((file) => file.size <= 10 * 1024 * 1024);
  }, "Each image must not exceed 10MB")
  .refine((files) => {
    if (!files?.length) return true;

    return files.length <= 5;
  }, "Maximum of 5 images allowed");

// For edit since featured image isn't a must to be edited
const optionalImageSchema = z
  .any()
  .optional()
  .refine((files) => {
    if (!files?.length) return true;

    return ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(files[0].type);
  }, "Only JPG, JPEG, PNG or WEBP images are allowed")
  .refine((files) => {
    if (!files?.length) return true;

    return files[0].size <= 10 * 1024 * 1024;
  }, "Image must not exceed 10MB");

const portfolioBaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().optional(),
  completion_date: z.string().min(1, "Completion date is required"),
  description: z.string().min(1, "Description is required"),
  client_type: z.string().optional(),
  project_duration: z.string().optional(),
  budget_range: z.string().optional(),
});

export const createPortfolioSchema = portfolioBaseSchema.extend({
  featured_image: imageSchema,
  gallery_images: gallery,
});

export const editPortfolioSchema = portfolioBaseSchema.extend({
  featured_image: optionalImageSchema,
  gallery_images: gallery.optional(),
});
