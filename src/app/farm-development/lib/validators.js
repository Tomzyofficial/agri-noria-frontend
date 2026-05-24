import { z } from 'zod';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uuidSchema = z.string().regex(uuidRegex, 'Invalid UUID');

export const QuoteRequestSchema = z.object({
  provider_id: uuidSchema,
  service_id: uuidSchema.optional().nullable(),
  client_name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  client_email: z.string().email('Invalid email address'),
  client_phone: z.string().optional().nullable(),
  client_organization: z.string().optional().nullable(),
  project_description: z.string().min(20, 'Please describe your project (min 20 characters)').max(5000),
  land_size: z.number().positive('Land size must be positive').optional().nullable(),
  land_size_unit: z.enum(['hectares', 'acres', 'sq_meters']).default('hectares'),
  location: z.string().optional().nullable(),
  budget_range: z.string().optional().nullable(),
  timeline: z.string().optional().nullable(),
  additional_notes: z.string().max(2000).optional().nullable(),
});

export const ProviderFilterSchema = z.object({
  state: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export const ServiceFilterSchema = z.object({
  provider_id: uuidSchema.optional(),
  category_slug: z.string().optional(),
  min_acreage: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});
