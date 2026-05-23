import { z } from "zod";

// Escrow release creation schema
export const escrowReleaseSchema = z.object({
  payment_id: z.string().min(1, "Payment ID is required"),
  order_id: z.string().min(1, "Order ID is required"),
  status: z.string().default("pending"),
  trigger_type: z.enum(["buyer_confirmed", "auto_release", "admin_override", "dispute_resolved"], {
    errorMap: () => ({
      message: "Invalid trigger type",
    }),
  }),
  released_by: z.string().optional(),
  release_amount: z.number().nonnegative("Release amount must be nonnegative"),
  reason: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional().default({}),
});

// Escrow release request schema
export const escrowReleaseRequestSchema = z.object({
  payment_id: z.string().min(1, "Payment ID is required"),
  trigger_type: z.enum(["buyer_confirmed", "auto_release", "admin_override", "dispute_resolved"], {
    errorMap: () => ({
      message: "Invalid trigger type",
    }),
  }),
  released_by: z.string().optional(),
  reason: z.string().optional(),
});

// Delivery confirmation creation schema
export const deliveryConfirmationSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  buyer_id: z.string().min(1, "Buyer ID is required"),
});

// OTP verification schema
export const otpVerificationSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  otp_code: z.string().min(1, "OTP code is required"),
});

// Photo confirmation schema
export const photoConfirmationSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  buyer_id: z.string().min(1, "Buyer ID is required"),
  proof_image: z.string().url("Proof image must be a valid URL"),
  notes: z.string().optional(),
  condition_rating: z.number().min(1).max(5).optional(),
});

export default escrowReleaseSchema;
