import { z } from "zod";

// Vlidation for vendor register form
export const registerFormSchema = z.object({
  fname: z
    .string()
    .trim()
    .min(2, { message: "First Name must be at least 2 characters long." })
    .regex(/^[A-Za-z\s]+$/, {
      message: "First name must contain only letters",
    }),
  lname: z
    .string()
    .trim()
    .min(2, { message: "Last Name must be at least 2 characters long." })
    .regex(/^[A-Za-z\s]+$/, { message: "Last name must contain only letters" }),
  email: z
    .string()
    .trim()
    .min(2, { message: "Email address is required" })
    .email({ message: "Invalid email address format" }),
  phone: z
    .string()
    .trim()
    .min(11, { message: "Phone number is required" })
    .max(11, { message: "Phone number must be 11 characters long" }),
  country_code: z.string().trim().min(2, { message: "Country is required" }),
  state_code: z.string().trim().min(2, { message: "State is required" }),
  // account_type: z.string().trim().min(2, { message: "Account type is required" }),
  pword: z
    .string()
    .trim()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-zA-Z]/, {
      message:
        "Password must contain at least one uppercase and lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character",
    }),
  confirmPword: z
    .string()
    .trim()
    .min(2, { message: "This field is required" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character",
    }),
  terms_of_service: z.literal(true, { message: "Accept the terms of service" }),
});

// Validation for vendor signin form
export const signinSchema = z.object({
  email: z
    .string()
    .trim()
    .min(2, { message: "Email address is required" })
    .email({ message: "Invalid email format" }),
  password: z.string().trim().min(2, { message: "Password is required" }),
});

// Validation for buyer register form
export const buyerSignupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(2, { message: "Email address is required" })
    .email({ message: "Invalid email format" }),
  name: z
    .string()
    .trim()
    .min(2, { message: "Full Name is required" })
    .regex(/^[A-Za-z\s]+$/, { message: "Full name must contain only letters" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-zA-Z]/, {
      message:
        "Password must contain at least one uppercase and lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character",
    }),
});
// Validation for buyer signin form
export const buyerSigninSchema = z.object({
  email: z
    .string()
    .trim()
    .min(2, { message: "Email address is required" })
    .email({ message: "Invalid email format" }),
  password: z.string().trim().min(2, { message: "Password is required" }),
});
