"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "react-toastify";
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";

export function EmailVerification({
  email,
  userType,
  onVerified,
  onBack,
  initialData = null,
}) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [errors, setErrors] = useState({});

  // Timer for resend button
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Check initial verification status
  useEffect(() => {
    if (initialData?.isVerified) {
      setIsVerified(true);
      setTimeout(() => {
        onVerified?.();
      }, 2000);
    }
  }, [initialData, onVerified]);

  /*  const sendVerificationCode = async () => {
      setIsLoading(true);
      setErrors({});

      try {
         const response = await fetch("/api/proxy/email-verification/send", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               email,
               userType,
            }),
         });

         const data = await response.json();

         if (!data.success) {
            if (data.code === "ALREADY_VERIFIED") {
               setIsVerified(true);
               setTimeout(() => {
                  onVerified?.();
               }, 2000);
               return;
            }
            throw new Error(data.error || "Failed to send verification code");
         }

         toast.success("Verification code sent to your email!");
         setTimeLeft(60); // 1 minute cooldown
      } catch (error) {
         console.error("Error sending verification code:", error);
         toast.error(error.message || "Failed to send verification code");
      } finally {
         setIsLoading(false);
      }
   }; */

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setErrors({ code: "Please enter a 6-digit verification code" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/proxy/email-verification/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          userType,
          verificationCode,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.code === "VERIFICATION_FAILED") {
          setErrors({ code: data.error });
        } else {
          throw new Error(data.error || "Verification failed");
        }
        return;
      }

      toast.success("Email verified successfully!");
      setIsVerified(true);

      // Call onVerified callback after a short delay
      setTimeout(() => {
        onVerified?.(data.user);
      }, 1500);
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (timeLeft > 0) return;

    setIsResending(true);
    setErrors({});

    try {
      const response = await fetch("/api/proxy/email-verification/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          userType,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.code === "ALREADY_VERIFIED") {
          setIsVerified(true);
          setTimeout(() => {
            onVerified?.();
          }, 2000);
          return;
        }
        throw new Error(data.error || "Failed to resend verification code");
      }

      toast.success("New verification code sent!");
      setTimeLeft(60); // Reset timer
      setVerificationCode(""); // Clear input
    } catch (error) {
      console.error("Error resending code:", error);
      toast.error(error.message || "Failed to resend verification code");
    } finally {
      setIsResending(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(value);
    setErrors({});
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && verificationCode.length === 6) {
      verifyCode();
    }
  };

  if (isVerified) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Email Verified!
          </h2>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified. Redirecting...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-2">
      <CardHeader className="flex justify-center">
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Verify Your Email</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-gray-600 mb-2">
            We've sent a 6-digit verification code to:
          </p>
          <p className="font-medium text-gray-900">{email}</p>
        </div>

        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="text-center text-2xl tracking-widest border border-gray-300 focus:outline-none"
              maxLength={6}
              disabled={isLoading}
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-2">{errors.code}</p>
            )}
          </div>

          <Button
            onClick={verifyCode}
            disabled={verificationCode.length !== 6 || isLoading}
            className="w-full flex justify-center cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Verifying...
              </div>
            ) : (
              "Verify Email"
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            Didn't receive the code?
          </div>

          <Button
            onClick={resendCode}
            disabled={timeLeft > 0 || isResending}
            className="w-full cursor-pointer"
          >
            {isResending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                Resending...
              </div>
            ) : timeLeft > 0 ? (
              `Resend in ${timeLeft}s`
            ) : (
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend Code
              </div>
            )}
          </Button>
        </div>

        {onBack && (
          <div className="text-center">
            <Button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-700 flex items-center justify-center space-x-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to registration</span>
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          <p>• Check your spam folder if you don't see the email</p>
          <p>• Verification code expires in 15 minutes</p>
        </div>
      </CardContent>
    </Card>
  );
}
