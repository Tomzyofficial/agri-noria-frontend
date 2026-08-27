import { z } from "zod";
import { imageFileTypes, MAX_FILE_SIZE } from "@/utils/otherUtils";

const fileSchema = z
   .instanceof(File, { message: "Expected a valid file" })
   .refine((file) => imageFileTypes.includes(file.type), "Only JPG, JPEG, PNG or WEBP images are allowed")
   .refine((file) => file.size <= MAX_FILE_SIZE, "Each image must not exceed 5MB");

const storageImageSchema = z.preprocess(
   (val) => {
      if (val == null) return [];
      return Array.isArray(val) ? val : [val];
   },
   z.array(fileSchema).min(1, { message: "At least one image file is required" }).max(5, { message: "Maximum 5 images allowed" })
);

export const storageFields = z.object({
   listing_name: z.string().trim().min(1, { message: "Storage name is required" }),
   href: z.string().trim().optional(),
   storage_type: z.string().min(1, { message: "Storage type is required" }),
   location: z.string().trim().min(1, { message: "Location is required" }),
   capacity: z.string().trim().min(1, { message: "Capacity is required" }),
   available: z.string().trim().min(1, { message: "Available is required" }),
   price: z
      .string()
      .trim()
      .min(1, { message: "Price is required" })
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
         message: "Price must be a valid number",
      }),
   temperature: z.string().trim().min(1, { message: "Temperature is required" }),
   description: z.string().trim().min(1, { message: "Description is required" }),
   features: z.array(z.string().trim().min(1)).min(1, { message: "At least one feature is required" }),
});

export const storageFormSchema = storageFields.extend({
   image: storageImageSchema,
});

export const updateStorageSchema = storageFields.extend({
   storageId: z.uuid(),
   image: z.preprocess(
      (val) => {
         if (val == null || val === "") return [];
         return Array.isArray(val) ? val : [val];
      },
      z.array(fileSchema).max(5, { message: "Maximum 5 images allowed" }).optional()
   ),
});
