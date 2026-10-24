"use client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";
import { signinSchema } from "@/_lib/validations/validateSignupSignin";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { FaSeedling, FaSpinner } from "react-icons/fa6";
import { signinBridge } from "@/actions/authActions";
import { verifyVendorSession } from "@/actions/session";
import { resolveRedirectPath } from "@/utils/routeResolver";

export function SigninForm() {
   const router = useRouter();
   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [errors, setErrors] = useState({});

   const [formData, setFormData] = useState({
      email: "",
      password: "",
      rememberMe: false,
   });

   // Handle input field change
   const handleInputChange = (e) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
      setErrors({});
   };

   // Handle form submission
   const handleSubmit = async (e) => {
      e.preventDefault();

      const normalizedData = {
         ...formData,
         email: formData.email.trim().toLowerCase(),
         password: formData.password.trim(),
      };

      setErrors({});

      // Validate both email and password together
      const finalCheck = signinSchema.safeParse(normalizedData);

      if (!finalCheck.success) {
         const fieldErrors = finalCheck.error.flatten().fieldErrors;
         setErrors({ err: fieldErrors });
         const firstMsg = Object.values(fieldErrors).flat().filter(Boolean)[0];
         if (firstMsg) toast.error(firstMsg);
         return;
      }

      try {
         setIsLoading(true);
         let result;
         try {
            const apiRes = await fetch("/api/auth/signin", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(normalizedData),
            });
            result = await apiRes.json();
         } catch {
            result = await signinBridge(normalizedData);
         }

         if (!result?.success) {
            toast.error([result?.error].flat().filter(Boolean).join(" ") || "Failed to login");
            return;
         }

         setErrors({});
         setFormData({
            email: "",
            password: "",
            rememberMe: false,
         });

         let session;
         try {
            const sessRes = await fetch("/api/auth/session");
            session = await sessRes.json();
         } catch {
            session = await verifyVendorSession();
         }

         if (session?.authenticated) {
            const { workspace, role } = session;
            const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
            const redirectTarget = searchParams?.get("redirect");

            if (redirectTarget && redirectTarget.startsWith("/")) {
               router.push(redirectTarget);
            } else if (
               workspace?.toLowerCase() === "ecosystem" && 
               role?.toLowerCase() === "farmer" && 
               session?.onboarding_status === "pending"
            ) {
               router.push("/ecosystem/farmer/onboarding");
            } else {
               const targetPath = resolveRedirectPath(role, workspace);
               router.push(targetPath);
            }
         } else {
            router.push("/ecosystem/farmer");
         }

         toast.success("Welcome back to Agri-Noria!");
      } catch (error) {
         setErrors((prev) => ({ ...prev, general: error.message }));
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="flex items-center justify-center p-4">
         <div className="w-full max-w-md">
            {/* Header with agricultural brand icon */}
            <div className="text-center mb-6">
               <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/10">
                  <FaSeedling className="w-7 h-7" />
               </div>
               <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Welcome Back</h1>
               <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">
                  Sign in to your Agri-Noria agricultural ecosystem account
               </p>
            </div>

            <Card className="text-left border border-emerald-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden">
               <CardHeader className="p-6 pb-2 text-left">
                  <h2 className="text-base font-black text-gray-900 dark:text-white">Account Credentials</h2>
                  <p className="text-xs text-gray-400">Enter your email and password to access your dashboard</p>
               </CardHeader>

               <CardContent className="p-6 pt-2 text-left">
                  <form onSubmit={handleSubmit} aria-busy={isLoading} className="space-y-4 text-left" noValidate>
                     {/* Email Address */}
                     <div className="space-y-1.5 text-left">
                        <Label htmlFor="email" className="block text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                           Email Address
                        </Label>
                        <Input 
                           autoFocus 
                           id="email" 
                           type="email" 
                           autoComplete="email" 
                           className={`h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 dark:focus:border-emerald-500 ${isLoading ? "opacity-50" : ""}`} 
                           disabled={isLoading} 
                           placeholder="farmer@agrinoria.eco" 
                           name="email" 
                           value={formData.email} 
                           onChange={handleInputChange} 
                           required 
                        />
                        {errors.err?.email && (
                           <p className="text-start text-rose-500 text-xs font-bold mt-1">
                              {errors.err.email[0] || errors.err.email}
                           </p>
                        )}
                     </div>

                     {/* Password in the exact same place! */}
                     <div className="space-y-1.5 text-left">
                        <div className="flex items-center justify-between">
                           <Label htmlFor="password" className="block text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                              Password
                           </Label>
                           <Link href="#" className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                              Forgot password?
                           </Link>
                        </div>
                        <div className="relative">
                           <Input 
                              id="password" 
                              autoComplete="current-password" 
                              className={`h-12 rounded-xl pr-11 border-gray-200 dark:border-gray-800 focus:border-emerald-500 dark:focus:border-emerald-500 ${isLoading ? "opacity-50" : ""}`} 
                              type={showPassword ? "text" : "password"} 
                              disabled={isLoading} 
                              placeholder="Enter your password" 
                              value={formData.password} 
                              name="password" 
                              onChange={handleInputChange} 
                              required 
                           />
                           <button 
                              type="button" 
                              className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition" 
                              onClick={() => setShowPassword(!showPassword)}
                              tabIndex={-1}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                           >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                        </div>
                        {errors.err?.password && (
                           <p className="text-start text-rose-500 text-xs font-bold mt-1">
                              {errors.err.password[0] || errors.err.password}
                           </p>
                        )}
                        {errors.general && (
                           <p className="text-start text-rose-500 text-xs font-bold mt-1">
                              {errors.general}
                           </p>
                        )}
                     </div>

                     {/* Remember Me */}
                     <div className="flex items-center space-x-2 pt-1 text-left">
                        <input
                           type="checkbox"
                           id="remember"
                           checked={formData.rememberMe}
                           name="rememberMe"
                           className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700 cursor-pointer"
                           disabled={isLoading}
                           onChange={(e) => {
                              setFormData((prev) => ({
                                 ...prev,
                                 rememberMe: e.target.checked,
                              }));
                           }}
                        />
                        <Label htmlFor="remember" className="text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer mb-0">
                           Remember this device
                        </Label>
                     </div>

                     {/* Sign In Button */}
                     <div className="pt-2">
                        <button 
                           type="submit" 
                           disabled={isLoading}
                           className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl py-3.5 px-6 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                           {isLoading ? (
                              <div className="flex justify-center items-center gap-2">
                                 <FaSpinner className="h-4 w-4 animate-spin" />
                                 <span>Signing in...</span>
                              </div>
                           ) : (
                              <div className="flex items-center gap-2">
                                 <FaSeedling className="w-3.5 h-3.5" />
                                 <span>Sign In</span>
                              </div>
                           )}
                        </button>
                     </div>
                  </form>

                  <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-900 text-center">
                     <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Don't have an account?{" "}
                        <Link href="/auth/register" className="text-emerald-600 dark:text-emerald-400 font-black hover:underline ml-1">
                           Register Account →
                        </Link>
                     </p>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
