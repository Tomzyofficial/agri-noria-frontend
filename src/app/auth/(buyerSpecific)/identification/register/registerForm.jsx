"use client";

import { Button } from "@/components/ui/Button";
import { FcGoogle } from "react-icons/fc";
import { FaChevronLeft } from "react-icons/fa6";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import Link from "next/link";
import { buyerSignupSchema } from "@/_lib/definitions";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa6";
import { useCartContext } from "@/hooks/useCartContext";
import { Eye, EyeOff } from "lucide-react";
import { buyerRegisterBridge } from "@/actions/authActions";

export function RegisterForm() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const returnUrl = searchParams.get("return");
   const [showPassword, setShowPassword] = useState(false);
   const [errors, setErrors] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [step, setStep] = useState(1);
   const [formData, setFormData] = useState({
      email: "",
      name: "",
      password: "",
   });

   const { mergeCartFromServer } = useCartContext();

   const handleInputChange = (e) => {
      setErrors({});
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   //  Client side validation; validate only the current step's field(s)
   const handleStepClick = () => {
      let validationResult;
      if (step === 1) {
         // Only validate email
         validationResult = buyerSignupSchema.pick({ email: true }).safeParse({
            email: formData.email,
         });
         if (!validationResult.success) {
            setErrors({ err: validationResult.error.flatten().fieldErrors });
            return;
         }
         setErrors({});
         setStep(2);
      } else if (step === 2) {
         // Only validate name
         validationResult = buyerSignupSchema.pick({ name: true }).safeParse({
            name: formData.name,
         });
         if (!validationResult.success) {
            setErrors({ err: validationResult.error.flatten().fieldErrors });
            return;
         }
         setErrors({});
         setStep(3);
      } else if (step === 3) {
         // Validate password (and all fields before submit)
         validationResult = buyerSignupSchema.safeParse({
            email: formData.email,
            name: formData.name,
            password: formData.password,
         });
         if (!validationResult.success) {
            toast.error("Your request couldn't complete at this time. Try again.");
            setErrors({ err: validationResult.error.flatten().fieldErrors });
            return;
         }
         setErrors({});
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      const normalizedData = {
         ...formData,
         email: formData.email.trim().toLowerCase(),
         name: formData.name.trim(),
         password: formData.password.trim(),
      };

      setIsLoading(true);
      try {
         const res = await buyerRegisterBridge(normalizedData);

         if (!res.success) {
            throw new Error([res.error].join(" ") || "Failed to register");
         }

         // Merge cart via CartContext method to update local state
         try {
            await mergeCartFromServer(res.buyerId);
         } catch (err) {
            throw new Error("Failed to merge cart");
         }
         router.push(returnUrl || "/buyer");
      } catch (err) {
         toast.error(err.message || "Internal server error. Try again.");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div>
         <div className="mb-5">
            {step === 1 ? (
               <p className="text-[var(--foreground] cursor-pointer">
                  Already have an accout?{" "}
                  <Link
                     className="text-blue-500 hover:underline"
                     href={
                        returnUrl
                           ? `/auth/identification/signin?return=${encodeURIComponent(returnUrl)}`
                           : "/auth/identification/signin"
                     }
                  >
                     Sign In
                  </Link>
               </p>
            ) : (
               <Button className="flex items-center" onClick={() => setStep(step - 1)}>
                  <FaChevronLeft /> Back
               </Button>
            )}
         </div>
         <form noValidate onSubmit={handleSubmit} aria-busy={isLoading}>
            {/* Email */}
            {step === 1 && (
               <>
                  <div>
                     <label htmlFor="email">Enter your email address</label>
                     <Input
                        autoFocus
                        autoComplete="on"
                        className={`border-1 border-gray-400 p-2 w-full rounded ${isLoading && "opacity-50"}`}
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                     />
                     {errors.err?.email && <p className="text-red-500">{errors.err.email[0]}</p>}
                     <Button
                        type="button"
                        className="bg-(--greenish-color) hover:bg-(--dark-green-color) p-2 w-full rounded text-lg cursor-pointer text-white mt-4"
                        onClick={handleStepClick}
                     >
                        Continue
                     </Button>
                     <p>
                        By continuing, you agree to company name{" "}
                        <Link href="/" className="text-blue-500 underline">
                           Contidition of Use{" "}
                        </Link>
                        and{" "}
                        <Link href="/" className="text-blue-500 underline">
                           Privacy Policy
                        </Link>
                     </p>
                  </div>

                  {/* Continue with google */}
                  <div>
                     <div className="flex items-center my-6">
                        <hr className="flex-grow h-px bg-gray-200 dark:bg-gray-700 border-0"></hr>
                        <span className="mx-4 text-lg text-center">Or</span>
                        <hr className="flex-grow h-px bg-gray-300 dark:bg-gray-600 border-0"></hr>
                     </div>
                     <Button
                        type="button"
                        className="border-1 w-full flex justify-center gap-2 items-center border-slate-400 p-2 rounded text-(--foreground)"
                     >
                        <span>
                           <FcGoogle />
                        </span>
                        Continue with google
                     </Button>
                  </div>
               </>
            )}

            {/* name */}
            {step === 2 && (
               <>
                  <div>
                     <label htmlFor="name">Enter your full name</label>
                     <Input
                        autoFocus
                        className={`border-1 border-gray-400 p-2 w-full rounded ${isLoading && "opacity-50"}`}
                        autoComplete="on"
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isLoading}
                     />
                  </div>
                  {errors.err?.name && <p className="text-red-500">{errors.err.name[0]}</p>}
                  <Button
                     type="button"
                     className={`${
                        isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                     } bg-(--greenish-color) p-2 w-full rounded text-lg text-(--white-fff) mt-4`}
                     onClick={handleStepClick}
                  >
                     Continue
                  </Button>
               </>
            )}

            {/* password */}
            {step === 3 && (
               <>
                  <div>
                     <label htmlFor="password">Enter your password</label>
                     <div className="relative">
                        <Input
                           autoFocus
                           className={`border-1 border-gray-400 p-2 w-full rounded ${isLoading && "opacity-50"}`}
                           autoComplete="off"
                           type={showPassword ? "text" : "password"}
                           name="password"
                           id="password"
                           value={formData.password}
                           onChange={handleInputChange}
                           disabled={isLoading}
                        />
                        <Button
                           type="button"
                           className="absolute cursor-pointer right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                           onClick={() => setShowPassword(!showPassword)}
                        >
                           {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                     </div>
                  </div>
                  {errors.err?.password && <p className="text-red-500">{errors.err.password[0]}</p>}
                  <Button
                     type="submit"
                     className={`${
                        isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                     } bg-(--greenish-color) hover:bg-(--dark-green-color) transition transition-background p-2 w-full rounded text-lg text-(--white-fff) mt-4`}
                     onClick={() => {
                        handleStepClick();
                        handleSubmit;
                     }}
                  >
                     {isLoading ? (
                        <div className="flex justify-center items-center gap-2">
                           <FaSpinner className="h-4 w-4 animate-spin" />
                           <span>Please wait...</span>
                        </div>
                     ) : (
                        "Create Account"
                     )}
                  </Button>
               </>
            )}
         </form>
      </div>
   );
}
