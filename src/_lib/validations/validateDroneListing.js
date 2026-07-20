/* import { z } from "zod";

const imageFileTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

const droneListingFields = z.object({
   listingName: z.string().trim().min(3, "Title must be at least 3 characters.").max(150, "Title cannot exceed 150 characters."),
   manufacturer: z.string().trim().min(2, "Manufacturer is required."),
   model: z.string().trim().min(2, "Model is required."),
   category: z.string().trim().min(1, "Please select a category."),
   listingType: z.enum(["sale", "rent", "both"], {
      error: "Please select a listing type.",
   }),
   location: z.string().trim().min(2, "Location is required."),
   quantity: z.coerce.number().positive({ error: "Quantity is required" }),
   unit: z.string({ error: "Unit is required" }),
   description: z.string().trim().min(20, "Description must be at least 20 characters."),

   salePrice: z.coerce.number().positive("Sale price must be a positive number").optional(),
   condition: z.enum(["new", "used", "refurbished"], "Select a condition").optional(),
   warranty: z.string().trim().max(100).optional(),

   rentalPrice: z.coerce.number().positive("Rental price must be positive").optional(),
   rentalPeriod: z.enum(["per_day", "per_week", "per_month"], "Please select a rental period").optional(),

   maxPayload: z.string().trim().optional(),
   operatingRange: z.string().trim().optional(),
   cameraType: z.string().trim().optional(),
   flightTime: z.string().trim().optional(),

   provideService: z.boolean({ error: "Please indicate if you provide drone operation services" }),
   serviceType: z.string().trim().optional(),
});

const listingRefinement = (data, ctx) => {
   if (data.listingType === "sale" || data.listingType === "both") {
      if (data.salePrice === undefined) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["salePrice"],
            message: "Selling price is required.",
         });
      }

      if (!data.condition) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["condition"],
            message: "Please select the drone condition.",
         });
      }
   }

   if (data.listingType === "rent" || data.listingType === "both") {
      if (data.rentalPrice === undefined) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["rentalPrice"],
            message: "Rental price is required.",
         });
      }

      if (!data.rentalPeriod) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["rentalPeriod"],
            message: "Please select the rental period.",
         });
      }
   }

   if (data.provideService && (!data.serviceType || data.serviceType.trim() === "")) {
      ctx.addIssue({
         code: z.ZodIssueCode.custom,
         path: ["serviceType"],
         message: "Service type is required.",
      });
   }
};

export const createDroneListingSchema = droneListingFields
   .extend({
      image: z
         .any()
         .refine((files) => files && files.length > 0, "At least one image file is required")
         .refine((files) => files?.length <= 5, "Maximum 5 images allowed")
         .refine((files) => Array.from(files).every((file) => imageFileTypes.includes(file.type)), "Only JPG, JPEG, PNG or WEBP images are allowed")
         .refine((files) => Array.from(files).every((file) => file.size <= 10 * 1024 * 1024), "Each image must not exceed 10MB"),
   })
   .superRefine(listingRefinement);

export const updateDroneListingSchema = droneListingFields
   .extend({
      image: z
         .any()
         .optional()
         .refine((files) => !files || files.length === 0 || files.length <= 5, "Maximum 5 images allowed")
         .refine((files) => !files || files.length === 0 || Array.from(files).every((file) => imageFileTypes.includes(file.type)), "Only JPG, JPEG, PNG or WEBP images are allowed")
         .refine((files) => !files || files.length === 0 || Array.from(files).every((file) => file.size <= 10 * 1024 * 1024), "Each image must not exceed 10MB"),
   })
   .superRefine(listingRefinement);

export function mapInventoryToFormValues(inventory) {
   return {
      listingName: inventory?.listing_name || "",
      manufacturer: inventory?.manufacturer || "",
      model: inventory?.model || "",
      category: inventory?.category || "",
      listingType: inventory?.listing_type || "",
      location: inventory?.location || "",
      quantity: inventory?.quantity ?? "",
      unit: inventory?.unit || "piece",
      description: inventory?.description || "",
      salePrice: inventory?.sale_price ?? "",
      condition: inventory?.condition || "",
      warranty: inventory?.warranty || "",
      rentalPrice: inventory?.rental_price ?? "",
      rentalPeriod: inventory?.rental_period || "",
      maxPayload: inventory?.max_payload || "",
      operatingRange: inventory?.operating_range || "",
      cameraType: inventory?.camera_specification || "",
      flightTime: inventory?.flight_time || "",
      provideService: inventory?.provide_service ?? false,
      serviceType: inventory?.service_type || "",
   };
}
 */

import { z } from "zod";

const imageFileTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

// Empty strings/null come from unselected or hidden form fields.
// Without this, .optional() never kicks in because "" !== undefined,
// which caused salePrice/condition/rentalPrice/rentalPeriod to be
// validated even when the field wasn't relevant to the chosen listingType.
const emptyToUndefined = (val) => (val === "" || val === null ? undefined : val);

const optionalPositiveNumber = (message) => z.preprocess(emptyToUndefined, z.coerce.number().positive(message).optional());

const optionalEnum = (values, message) => z.preprocess(emptyToUndefined, z.enum(values, { error: message }).optional());

const droneListingFields = z.object({
   listingName: z.string().trim().min(3, "Title must be at least 3 characters.").max(150, "Title cannot exceed 150 characters."),
   manufacturer: z.string().trim().min(2, "Manufacturer is required."),
   model: z.string().trim().min(2, "Model is required."),
   category: z.string().trim().min(1, "Please select a category."),
   listingType: z.enum(["sale", "rent", "both"], {
      error: "Please select a listing type.",
   }),
   location: z.string().trim().min(2, "Location is required."),
   quantity: z.coerce.number().positive("Quantity is required"),
   unit: z.string().min(2, "Unit is required"),
   description: z.string().trim().min(20, "Description must be at least 20 characters."),

   salePrice: optionalPositiveNumber("Sale price must be a positive number"),
   condition: optionalEnum(["new", "used", "refurbished"], "Select a condition"),
   warranty: z.string().trim().max(50, "Warranty cannot exceed 50 characters").optional(),

   rentalPrice: optionalPositiveNumber("Rental price must be positive"),
   rentalPeriod: optionalEnum(["per_day", "per_week", "per_month"], "Please select a rental period"),

   maxPayload: z.string().trim().min(2, "Maximum payload is required"),
   operatingRange: z.string().trim().min(2, "Operating range is required"),
   cameraType: z.string().trim().min(2, "Camera type is required"),
   flightTime: z.string().trim().min(2, "Flight time is required"),

   provideService: z.boolean("Please indicate if you provide drone operation services"),
   serviceType: z.string().trim().optional(),
});

const listingRefinement = (data, ctx) => {
   if (data.listingType === "sale" || data.listingType === "both") {
      if (data.salePrice === undefined) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["salePrice"],
            message: "Selling price is required.",
         });
      }

      if (!data.condition) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["condition"],
            message: "Please select the drone condition.",
         });
      }
   }

   if (data.listingType === "rent" || data.listingType === "both") {
      if (data.rentalPrice === undefined) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["rentalPrice"],
            message: "Rental price is required.",
         });
      }

      if (!data.rentalPeriod) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["rentalPeriod"],
            message: "Please select the rental period.",
         });
      }
   }

   if (data.provideService && (!data.serviceType || data.serviceType.trim() === "")) {
      ctx.addIssue({
         code: z.ZodIssueCode.custom,
         path: ["serviceType"],
         message: "Service type is required.",
      });
   }
};

export const createDroneListingSchema = droneListingFields
   .extend({
      image: z
         .any()
         .refine((files) => files && files.length > 0, "At least one image file is required")
         .refine((files) => files?.length <= 5, "Maximum 5 images allowed")
         .refine((files) => Array.from(files).every((file) => imageFileTypes.includes(file.type)), "Only JPG, JPEG, PNG or WEBP images are allowed")
         .refine((files) => Array.from(files).every((file) => file.size <= 10 * 1024 * 1024), "Each image must not exceed 10MB"),
   })
   .superRefine(listingRefinement);

export const updateDroneListingSchema = droneListingFields
   .extend({
      image: z
         .any()
         .optional()
         .refine((files) => !files || files.length === 0 || files.length <= 5, "Maximum 5 images allowed")
         .refine((files) => !files || files.length === 0 || Array.from(files).every((file) => imageFileTypes.includes(file.type)), "Only JPG, JPEG, PNG or WEBP images are allowed")
         .refine((files) => !files || files.length === 0 || Array.from(files).every((file) => file.size <= 10 * 1024 * 1024), "Each image must not exceed 10MB"),
   })
   .superRefine(listingRefinement);

export function mapInventoryToFormValues(inventory) {
   return {
      listingName: inventory?.listing_name || "",
      manufacturer: inventory?.manufacturer || "",
      model: inventory?.model || "",
      category: inventory?.category || "",
      listingType: inventory?.listing_type || "",
      location: inventory?.location || "",
      quantity: inventory?.quantity ?? "",
      unit: inventory?.unit || "piece",
      description: inventory?.description || "",
      salePrice: inventory?.sale_price ?? "",
      condition: inventory?.condition || "",
      warranty: inventory?.warranty || "",
      rentalPrice: inventory?.rental_price ?? "",
      rentalPeriod: inventory?.rental_period || "",
      maxPayload: inventory?.max_payload || "",
      operatingRange: inventory?.operating_range || "",
      cameraType: inventory?.camera_type || "",
      flightTime: inventory?.flight_time || "",
      provideService: inventory?.provide_service ?? false,
      serviceType: inventory?.service_type || "",
   };
}
