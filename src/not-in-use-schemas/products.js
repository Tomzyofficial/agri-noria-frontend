// src/schemas/product.schema.ts

import { z } from "zod";

export const BaseProductSchema = z.object({
   role: z.enum(["Farmer", "Seller"]),
   product_image: z.any(),
   listing_name: z.string().min(1),
   description: z.string().min(1),
   price: z.string().min(1),
   location: z.string().min(1),
   quantity_value: z.string().min(1),
   quantity_unit: z.string().min(1),
   discount: z.string().optional(),
});

export const FarmerSchema = z.object({
   harvest_date: z.string().min(1),
   crop_type: z.string().min(1),
   variety: z.string().min(1),
   quality: z.enum(["Premium", "Good", "Fair", "Standard"]),
   organic: z.enum(["Yes", "No", "In Process"]),
});

export const SellerSchema = z.object({
   equipment_type: z.string().min(1),
   brand: z.string().min(1),
   model: z.string().min(1),
   condition: z.enum(["New", "Used - Excellent", "Used - Good", "Refurbished"]),
   warranty: z.string().optional(),
});

export const ProductFormSchema = z.discriminatedUnion("role", [
   BaseProductSchema.extend(FarmerSchema.shape).extend({
      role: z.literal("Farmer"),
   }),
   BaseProductSchema.extend(SellerSchema.shape).extend({
      role: z.literal("Seller"),
   }),
]);
