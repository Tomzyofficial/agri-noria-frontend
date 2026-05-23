import { z } from "zod";

// Coordinates schema
const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

// Shipment creation schema
export const shipmentSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  logistics_company_id: z.string().optional(),
  vehicle_id: z.string().optional(),
  driver_id: z.string().optional(),
  status: z.enum(["pending", "assigned", "picked_up", "in_transit", "delivered", "cancelled"], {
    errorMap: () => ({
      message: "Invalid shipment status",
    }),
  }).default("pending"),
  pickup_location: z.string().min(1, "Pickup location is required"),
  pickup_coordinates: coordinatesSchema.optional(),
  pickup_scheduled_time: z.string().datetime().optional(),
  delivery_location: z.string().min(1, "Delivery location is required"),
  delivery_coordinates: coordinatesSchema.optional(),
  estimated_delivery_time: z.string().datetime().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional().default({}),
});

// Shipment status update schema
export const shipmentStatusSchema = z.object({
  status: z.enum(["pending", "assigned", "picked_up", "in_transit", "delivered", "cancelled"], {
    errorMap: () => ({
      message: "Invalid shipment status",
    }),
  }),
  pickup_completed_at: z.string().datetime().optional(),
  actual_delivery_time: z.string().datetime().optional(),
  current_location: z.string().optional(),
  current_coordinates: coordinatesSchema.optional(),
  notes: z.string().optional(),
});

// Logistics assignment schema
export const logisticsAssignmentSchema = z.object({
  logistics_company_id: z.string().min(1, "Logistics company ID is required"),
  vehicle_id: z.string().min(1, "Vehicle ID is required"),
  driver_id: z.string().min(1, "Driver ID is required"),
});

// Shipment location update schema
export const shipmentLocationSchema = z.object({
  location: z.string().min(1, "Location is required"),
  coordinates: coordinatesSchema,
});

export default shipmentSchema;
