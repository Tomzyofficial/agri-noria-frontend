import { z } from "zod";

export const quoteRequestSchema = z.object({
   full_name: z.string().trim().min(2, "Enter your full name."),
   email: z.string().trim().email("Enter a valid email address."),
   phone: z.string().trim().min(7, "Enter a valid phone number.").optional().or(z.literal("")),
   start_date: z.string().min(1, "Select a start date."),
   rentalDurationDays: z.coerce.number().positive("Enter how many days you need it for."),
   additional_info: z.string().trim().max(500, "Keep your note under 500 characters.").optional().or(z.literal("")),
});
