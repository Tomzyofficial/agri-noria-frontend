"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useState } from "react";
import Link from "next/link";
import { buyerSignupSchema } from "@/_lib/validations/validateSignupSignin";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { FaSeedling, FaSpinner } from "react-icons/fa6";
import { useCartContext } from "@/hooks/useCartContext";
import { buyerRegisterBridge } from "@/actions/authActions";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("return");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { mergeCartFromServer } = useCartContext();

  const handleInputChange = (e) => {
    setErrors({});
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password.trim(),
    };

    setErrors({});

    // Client-side schema validation of all fields together
    const validationResult = buyerSignupSchema.safeParse(normalizedData);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      setErrors({ err: fieldErrors });
      const firstMsg = Object.values(fieldErrors).flat().filter(Boolean)[0];
      if (firstMsg) toast.error(firstMsg);
      return;
    }

    setIsLoading(true);
    try {
      const res = await buyerRegisterBridge(normalizedData);

      if (!res.success) {
        throw new Error([res.error].join(" ") || "Failed to register");
      }

      // Merge cart via CartContext
      try {
        await mergeCartFromServer(res.buyerId);
      } catch (err) {
        console.error("Cart sync notice:", err);
      }

      toast.success("Account created successfully!");
      router.push(returnUrl || "/dashboard/buyer");
    } catch (err) {
      toast.error(err.message || "Failed to create account. Try again.");
      setErrors((prev) => ({ ...prev, general: err.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form noValidate onSubmit={handleSubmit} aria-busy={isLoading} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Full Name
          </Label>
          <Input
            autoFocus
            className={`h-11 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 ${isLoading ? "opacity-50" : ""}`}
            type="text"
            name="name"
            id="name"
            autoComplete="name"
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
          {errors.err?.name && (
            <p className="text-rose-500 text-xs font-bold">{errors.err.name[0]}</p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Email Address
          </Label>
          <Input
            className={`h-11 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 ${isLoading ? "opacity-50" : ""}`}
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            placeholder="buyer@agrinoria.eco"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
          {errors.err?.email && (
            <p className="text-rose-500 text-xs font-bold">{errors.err.email[0]}</p>
          )}
        </div>

        {/* Password (IN SAME PLACE - NO CONTINUE BUTTON) */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Password
          </Label>
          <div className="relative">
            <Input
              className={`h-11 pr-10 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 ${isLoading ? "opacity-50" : ""}`}
              autoComplete="new-password"
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Min. 8 chars, 1 uppercase, number & symbol"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
            <Button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.err?.password && (
            <p className="text-rose-500 text-xs font-bold">{errors.err.password[0]}</p>
          )}
        </div>

        {errors.general && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold">
            {errors.general}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className={`w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isLoading ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <FaSpinner className="h-4 w-4 animate-spin" />
              <span>Creating Account...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FaSeedling className="w-4 h-4" />
              <span>Create Account</span>
            </span>
          )}
        </Button>

        {/* Terms notice */}
        <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center pt-2">
          By registering, you agree to Agri-Noria&apos;s{" "}
          <Link href="/terms" className="text-emerald-600 dark:text-emerald-400 underline font-semibold">
            Conditions of Use
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-emerald-600 dark:text-emerald-400 underline font-semibold">
            Privacy Notice
          </Link>
          .
        </p>

        {/* Already have an account link */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              href={
                returnUrl
                  ? `/auth/identification/signin?return=${encodeURIComponent(returnUrl)}`
                  : "/auth/identification/signin"
              }
            >
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
