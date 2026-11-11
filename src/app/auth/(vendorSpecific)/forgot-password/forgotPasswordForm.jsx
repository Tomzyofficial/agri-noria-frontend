"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { toast } from "react-toastify";
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { FaSeedling, FaSpinner } from "react-icons/fa6";

export function ForgotPasswordForm() {
  const router = useRouter();

  // Current Step: 1 = Email, 2 = 6-digit OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  // OTP inputs (6 digits)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputsRef = useRef([]);

  // Passwords
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Countdown timer for resending OTP
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Mask email for display in Step 2: e.g. "fa***r@gmail.com"
  const getMaskedEmail = (rawEmail) => {
    if (!rawEmail || !rawEmail.includes("@")) return rawEmail;
    const [name, domain] = rawEmail.split("@");
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
  };

  // -------------------------------------------------------------
  // STEP 1: Request Password Reset Code
  // -------------------------------------------------------------
  const handleRequestCode = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy/auth/vendor/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "Reset code sent to your email!");
        setStep(2);
        setResendCooldown(60);
        // Focus first OTP box
        setTimeout(() => {
          if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
        }, 100);
      } else {
        const msg = [data.error].flat().filter(Boolean).join(" ") || "Failed to send reset code";
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("Forgot password request error:", err);
      const msg = "Network error connecting to authentication service.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 2: Handle OTP Digits & Verification
  // -------------------------------------------------------------
  const handleDigitChange = (index, value) => {
    // Only accept numeric characters
    const cleanValue = value.replace(/\D/g, "");
    const updated = [...otpDigits];

    if (!cleanValue) {
      updated[index] = "";
      setOtpDigits(updated);
      return;
    }

    // Handle single digit input
    updated[index] = cleanValue.slice(-1);
    setOtpDigits(updated);
    setErrorMsg("");

    // Auto-advance to next input box
    if (index < 5 && cleanValue) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // If all 6 digits are filled, automatically submit
    const fullCode = updated.join("");
    if (fullCode.length === 6) {
      submitVerifyOtp(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace on empty input moves focus back
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const updated = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i];
    }
    setOtpDigits(updated);

    if (pasted.length === 6) {
      submitVerifyOtp(pasted);
    } else {
      otpInputsRef.current[pasted.length]?.focus();
    }
  };

  const submitVerifyOtp = async (codeString) => {
    const code = codeString || otpDigits.join("");
    if (code.length < 6) {
      setErrorMsg("Please enter all 6 digits of your reset code.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/proxy/auth/vendor/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Security code verified!");
        setResetToken(data.reset_token);
        setStep(3);
      } else {
        const msg = [data.error].flat().filter(Boolean).join(" ") || "Invalid verification code";
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setErrorMsg("Network error verifying security code.");
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 3: Submit New Password
  // -------------------------------------------------------------
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy/auth/vendor/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          reset_token: resetToken,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "Password reset successfully!");
        setStep(4);
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      } else {
        const msg = [data.error].flat().filter(Boolean).join(" ") || "Failed to reset password";
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setErrorMsg("Network error resetting password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full text-center">
      {/* Brand Icon Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/10">
          <FaSeedling className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Agri-Noria Ecosystem
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">
          Secure Password Recovery & Access Restoration
        </p>
      </div>

      <Card className="text-left border border-emerald-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden">
        {/* Step Progress Indicators */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              {step < 4 ? step : "✓"}
            </span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {step === 1 && "Step 1: Account Email"}
              {step === 2 && "Step 2: Security Verification"}
              {step === 3 && "Step 3: New Password"}
              {step === 4 && "Completed"}
            </span>
          </div>
          {step < 4 && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              Step {step} of 3
            </span>
          )}
        </div>

        <CardHeader className="p-6 pb-2 text-left">
          {step === 1 && (
            <>
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Reset Your Password
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter your registered ecosystem email. We'll send you a 6-digit OTP code to verify your identity.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Enter 6-Digit Code
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                We sent a security code to <strong className="text-emerald-600 dark:text-emerald-400">{getMaskedEmail(email)}</strong>. Code expires in 15 minutes.
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Set New Password
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose a strong new password with at least 8 characters.
              </p>
            </>
          )}

          {step === 4 && (
            <div className="text-center py-2">
              <h2 className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                Password Successfully Reset!
              </h2>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 pt-2 text-left">
          {/* General Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold leading-relaxed">
              {errorMsg}
            </div>
          )}

          {/* ----------------- STEP 1: EMAIL INPUT ----------------- */}
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="block text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Registered Email Address
                </Label>
                <div className="relative">
                  <Input
                    autoFocus
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="farmer@agrinoria.eco"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg("");
                    }}
                    disabled={isLoading}
                    required
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 pr-10 text-sm font-medium"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl py-3.5 px-6 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="h-4 w-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ----------------- STEP 2: 6-DIGIT OTP INPUT ----------------- */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 text-center">
                  6-Digit Verification Code
                </Label>
                <div className="flex items-center justify-between gap-2 sm:gap-2.5 max-w-sm mx-auto" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      disabled={isLoading}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-xl border-2 border-gray-200 dark:border-gray-800 focus:border-emerald-500 dark:focus:border-emerald-400 focus:bg-emerald-50/20 dark:focus:bg-emerald-950/20 bg-transparent text-gray-900 dark:text-white outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => submitVerifyOtp()}
                disabled={isLoading || otpDigits.join("").length < 6}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl py-3.5 px-6 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="h-4 w-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Code</span>
                  </>
                )}
              </button>

              {/* Resend Cooldown & Change Email */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs border-t border-gray-100 dark:border-gray-900">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg("");
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Change email
                </button>

                {resendCooldown > 0 ? (
                  <span className="text-gray-400 font-medium text-[11px]">
                    Resend code in <strong className="text-emerald-600">{resendCooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestCode}
                    disabled={isLoading}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend OTP Code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ----------------- STEP 3: SET NEW PASSWORD ----------------- */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    autoFocus
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="Enter at least 8 characters"
                    disabled={isLoading}
                    required
                    className="h-12 rounded-xl pr-11 border-gray-200 dark:border-gray-800 focus:border-emerald-500 text-sm"
                  />
                  <button
                    type="button"
                    className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="Re-type your new password"
                    disabled={isLoading}
                    required
                    className="h-12 rounded-xl pr-11 border-gray-200 dark:border-gray-800 focus:border-emerald-500 text-sm"
                  />
                  <button
                    type="button"
                    className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 text-[11px] space-y-1">
                <div className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? "text-emerald-600 font-bold" : "text-gray-400"}`}>
                  <span>{newPassword.length >= 8 ? "✓" : "○"}</span>
                  <span>Minimum 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${newPassword && newPassword === confirmPassword ? "text-emerald-600 font-bold" : "text-gray-400"}`}>
                  <span>{newPassword && newPassword === confirmPassword ? "✓" : "○"}</span>
                  <span>Passwords match</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || newPassword.length < 8 || newPassword !== confirmPassword}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl py-3.5 px-6 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="h-4 w-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Save New Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ----------------- STEP 4: SUCCESS CONFIRMATION ----------------- */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Your credentials have been securely updated.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Redirecting to Sign In in a few seconds...
                </p>
              </div>

              <Link href="/auth/signin" className="block">
                <button
                  type="button"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Sign In Now →
                </button>
              </Link>
            </div>
          )}

          {/* Bottom Back to Sign In Link */}
          {step < 4 && (
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-900 text-center">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Remember your password?{" "}
                <Link href="/auth/signin" className="text-emerald-600 dark:text-emerald-400 font-black hover:underline ml-1">
                  Back to Sign In →
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
