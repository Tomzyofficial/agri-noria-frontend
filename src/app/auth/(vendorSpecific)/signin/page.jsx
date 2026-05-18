import { SigninForm } from "@/app/auth/(vendorSpecific)/signin/signinForm";
import { verifyVendorSession } from "@/actions/session";
import { redirect } from "next/navigation";

export const metadata = {
   title: "Sign in",
   description: "Sign in to access your account",
};

export default async function SigninPage() {
   // If user is already logged in, and maybe navigate back to the home page, when next the click the account icon, redirect them back to their dashboard
   const user = await verifyVendorSession();
   if (user.authenticated) {
      redirect("/dashboard");
   }

   return (
      <div className="min-h-screen bg-(--white-fff) dark:bg-(--background) flex lg:items-center">
         <div className="w-full mx-auto max-w-2xl px-2 mt-10 lg:mt-0">
            <SigninForm />
         </div>
      </div>
   );
}
