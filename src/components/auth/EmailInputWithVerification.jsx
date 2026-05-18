"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { toast } from "react-toastify";
import { Mail, Check, AlertCircle, Loader2 } from "lucide-react";

export function EmailInputWithVerification({
   value,
   onChange,
   userType,
   onEmailVerified,
   disabled = false,
   error = "",
}) {
   const [isVerifying, setIsVerifying] = useState(false);
   const [isVerified, setIsVerified] = useState(false);
   // const [showVerificationInput, setShowVerificationInput] = useState(false);
   // const [verificationCode, setVerificationCode] = useState("");
   // const [verificationError, setVerificationError] = useState("");
   // const [timeLeft, setTimeLeft] = useState(0);

   // Check email verification status when email changes
   useEffect(() => {
      if (value && value.includes("@")) {
         checkVerificationStatus();
      } else {
         setIsVerified(false);
         // setShowVerificationInput(false);
      }
   }, [value]);

   // Timer for resend button
   /*    useEffect(() => {
      if (timeLeft > 0) {
         const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
         return () => clearTimeout(timer);
      }
   }, [timeLeft]); */

   const checkVerificationStatus = async () => {
      try {
         const response = await fetch(
            `/api/proxy/email-verification/status?email=${encodeURIComponent(value)}&userType=${userType}`,
         );
         const data = await response.json();

         if (data.success) {
            setIsVerified(data.data.isVerified);
            if (data.data.isVerified) {
               onEmailVerified?.(true);
            }
         }
      } catch (error) {
         console.error("Error checking verification status:", error);
      }
   };

   const sendVerificationCode = async () => {
      if (!value || !value.includes("@")) {
         toast.error("Please enter a valid email address");
         return;
      }

      setIsVerifying(true);

      try {
         const response = await fetch("/api/proxy/email-verification/send", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               email: value,
               userType,
            }),
         });

         // if (!response.ok) {
         //    throw new Error("Failed to send verification code with status code of: " + response.status);
         // }
         const data = await response.json();

         if (!response.ok || !data.success) {
            if (data.code === "ALREADY_VERIFIED") {
               setIsVerified(true);
               onEmailVerified?.(true);
               toast.success("Email is already verified!");
               return;
            }
            throw new Error(data.error || "Failed to send verification code");
         }
         toast.success("Verification code sent to your email!");
      } catch (error) {
         console.error("Error sending verification code:", error);
         toast.error(error.message || "Failed to send verification code");
      } finally {
         setIsVerifying(false);
      }
   };

   /*  const verifyCode = async () => {
      if (verificationCode.length !== 6) {
         setVerificationError("Please enter a 6-digit verification code");
         return;
      }

      setIsVerifying(true);
      setVerificationError("");

      try {
         const response = await fetch("/api/proxy/email-verification/verify", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               email: value,
               userType,
               verificationCode,
            }),
         });

         const data = await response.json();

         if (!data.success) {
            setVerificationError(data.error || "Verification failed");
            return;
         }

         setIsVerified(true);
         setShowVerificationInput(false);
         setVerificationCode("");
         onEmailVerified?.(true);
         toast.success("Email verified successfully!");
      } catch (error) {
         console.error("Error verifying code:", error);
         setVerificationError(error.message || "Verification failed");
      } finally {
         setIsVerifying(false);
      }
   }; */

   /*  const resendCode = async () => {
      if (timeLeft > 0) return;

      setIsVerifying(true);
      setVerificationError("");

      try {
         const response = await fetch("/api/proxy/email-verification/resend", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               email: value,
               userType,
            }),
         });

         const data = await response.json();

         if (!data.success) {
            if (data.code === "ALREADY_VERIFIED") {
               setIsVerified(true);
               onEmailVerified?.(true);
               toast.success("Email is already verified!");
               return;
            }
            throw new Error(data.error || "Failed to resend verification code");
         }

         setTimeLeft(60);
         setVerificationCode("");
         toast.success("New verification code sent!");
      } catch (error) {
         console.error("Error resending code:", error);
         setVerificationError(error.message || "Failed to resend verification code");
      } finally {
         setIsVerifying(false);
      }
   }; */

   /*   const handleVerificationInputChange = (e) => {
      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
      setVerificationCode(value);
      setVerificationError("");
   }; */

   return (
      <div className="space-y-4">
         <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center space-x-2">
               <span>Email Address</span>
               {/* {isVerified && <Check className="h-4 w-4 text-green-600" />} */}
            </Label>
            <div className="flex space-x-2">
               <div className="flex-1">
                  <Input
                     id="email"
                     name="email"
                     type="email"
                     value={value}
                     onChange={(e) => {
                        onChange(e);
                        // setVerificationError("");
                     }}
                     placeholder="john@example.com"
                     disabled={disabled}
                     className={isVerified ? "border-green-500 bg-green-50" : ""}
                     required
                  />
               </div>
               {!isVerified && value && value.includes("@") && (
                  <Button
                     type="button"
                     onClick={sendVerificationCode}
                     disabled={isVerifying || !value || !value.includes("@")}
                     className="cursor-pointer px-4"
                  >
                     {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                  </Button>
               )}
            </div>
            {error && (
               <p className="text-red-500 dark:text-red-400 text-sm flex items-center">
                  {/* <AlertCircle className="h-4 w-4 mr-1" /> */}
                  {error}
               </p>
            )}
            {isVerified && (
               <p className="text-green-600 text-sm flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  Email verified successfully
               </p>
            )}
         </div>

         {/*  {showVerificationInput && !isVerified && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
               <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Enter verification code</span>
               </div>
               <div className="flex space-x-2">
                  <Input
                     type="text"
                     placeholder="6-digit code"
                     value={verificationCode}
                     onChange={handleVerificationInputChange}
                     className="text-center tracking-widest"
                     maxLength={6}
                     disabled={isVerifying}
                  />
                  <Button onClick={verifyCode} disabled={verificationCode.length !== 6 || isVerifying} size="sm">
                     {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                  </Button>
               </div>
               {verificationError && <p className="text-red-500 text-sm">{verificationError}</p>}
               <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Didn't receive the code?</span>
                  <Button
                     type="button"
                     onClick={resendCode}
                     disabled={timeLeft > 0 || isVerifying}
                     variant="ghost"
                     size="sm"
                     className="text-xs"
                  >
                     {timeLeft > 0 ? `Resend in ${timeLeft}s` : "Resend"}
                  </Button>
               </div>
            </div>
         )} */}
      </div>
   );
}
