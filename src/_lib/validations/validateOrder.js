import { z } from "zod";

// Order item schema
const orderItemSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  product_type: z.enum(["produce", "equipment"], {
    errorMap: () => ({
      message: "Product type must be either 'produce' or 'equipment'",
    }),
  }),
  quantity: z.number().positive("Quantity must be positive"),
  unit_price: z.number().nonnegative("Unit price must be nonnegative"),
  packaging_type: z.string().optional(),
  unit_measure: z.string().optional(),
  product_name: z.string().min(1, "Product name is required"),
  product_image: z.string().url("Product image must be a valid URL"),
});

// Order creation schema
export const orderSchema = z.object({
  buyer_id: z.string().min(1, "Buyer ID is required"),
  seller_id: z.string().min(1, "Seller ID is required"),
  total_amount: z.number().positive("Total amount must be positive"),
  currency: z.string().default("NGN"),
  fulfillment_type: z.enum(["delivery", "pickup"], {
    errorMap: () => ({
      message: "Fulfillment type must be either 'delivery' or 'pickup'",
    }),
  }),
  delivery_address: z.string().optional(),
  delivery_fee: z.number().nonnegative("Delivery fee must be nonnegative").default(0),
  estimated_delivery_time: z.string().datetime().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional().default({}),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

// Order status update schema
export const orderStatusSchema = z.object({
  status: z.enum(
    ["pending", "paid", "processing", "shipped", "in_transit", "delivered", "completed", "cancelled", "refunded"],
    {
      errorMap: () => ({
        message: "Invalid order status",
      }),
    }
  ),
});

// Order cancellation schema
export const orderCancellationSchema = z.object({
  reason: z.string().optional(),
});

export default orderSchema;
