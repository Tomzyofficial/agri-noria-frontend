import { z } from "zod";

// Payment creation schema
export const paymentSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  payer_id: z.string().min(1, "Payer ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("NGN"),
  payment_provider: z.string().optional(),
  provider_reference: z.string().optional(),
  provider_payment_code: z.string().optional(),
  status: z.enum(["pending", "processing", "completed", "failed", "refunded"], {
    errorMap: () => ({
      message: "Invalid payment status",
    }),
  }).default("pending"),
  escrow_status: z.enum(["held", "released", "refunded", "disputed"], {
    errorMap: () => ({
      message: "Invalid escrow status",
    }),
  }).default("held"),
  payment_method: z.string().optional(),
  metadata: z.record(z.any()).optional().default({}),
});

// Payment status update schema
export const paymentStatusSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed", "refunded"], {
    errorMap: () => ({
      message: "Invalid payment status",
    }),
  }),
  provider_reference: z.string().optional(),
  provider_payment_code: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Escrow status update schema
export const escrowStatusSchema = z.object({
  escrow_status: z.enum(["held", "released", "refunded", "disputed"], {
    errorMap: () => ({
      message: "Invalid escrow status",
    }),
  }),
  release_reason: z.string().optional(),
});

// Payment refund schema
export const paymentRefundSchema = z.object({
  reason: z.string().min(1, "Refund reason is required"),
});

export default paymentSchema;
