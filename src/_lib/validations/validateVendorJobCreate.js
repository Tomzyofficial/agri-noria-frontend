import { z } from "zod";

export const createJobSchema = z
  .object({
    title: z.string().trim().min(3, "Job title must be at least 3 characters"),
    category: z.string().min(1, "Please select a job category"),
    customCategory: z.string().optional(),
    employmentType: z.string().min(1, "Please select an employment type"),
    openings: z.coerce.number().min(1, "Openings must be at least 1"),
    state: z.string().trim().min(2, "State is required"),
    city: z.string().trim().min(2, "City is required"),
    country: z.string().trim().min(2, "Country is required"),
    deadline: z.string().min(1, "Application deadline is required"),
    locationType: z.string().min(1, "Please select a location type"),
    salaryType: z.string().min(1, "Please select a salary type"),
    salaryMin: z.coerce.number().nonnegative("Minimum salary cannot be negative").optional(),
    salaryMax: z.coerce.number().nonnegative("Maximum salary cannot be negative").optional(),
    experienceLevel: z.string().min(1, "Please select an experience level"),
    educationLevel: z.string().min(1, "Please select an education level"),
    description: z.string().trim().min(30, "Job description is too short"),
    responsibilities: z.string().trim().min(20, "Responsibilities are required"),
    requirements: z.string().trim().min(20, "Requirements are required"),
    benefits: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "other" && !data.customCategory?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customCategory"],
        message: "Please specify the custom category",
      });
    }

    if (data.salaryMin && data.salaryMax && data.salaryMin > data.salaryMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salaryMax"],
        message: "Maximum salary must be greater than minimum salary",
      });
    }

    const deadline = new Date(data.deadline);

    if (deadline <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deadline"],
        message: "Application deadline must be in the future",
      });
    }
  });
