import { SigninForm } from "@/app/auth/(vendorSpecific)/signin/signinForm";

export const metadata = {
  title: "Sign In | Agri-Noria Ecosystem",
  description: "Sign in to access your ecosystem or vendor account",
};

export default async function SigninPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-(--background) flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <SigninForm />
      </div>
    </div>
  );
}
