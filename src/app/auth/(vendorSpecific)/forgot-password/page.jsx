import { ForgotPasswordForm } from "@/app/auth/(vendorSpecific)/forgot-password/forgotPasswordForm";

export const metadata = {
  title: "Forgot Password | Agri-Noria Ecosystem",
  description: "Reset your Agri-Noria ecosystem password securely via email verification",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-(--background) flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
