import { RegisterForm } from "./registerForm";
import { verifyVendorSession } from "@/actions/session";
import { redirect } from "next/navigation";

export const metadata = {
   title: "Register",
   description: "Register to create an account",
};

export default async function RegisterPage() {
   const session = await verifyVendorSession();
   if (session.authenticated) {
      redirect("/dashboard");
   }
   return (
      <div>
         <RegisterForm />
      </div>
   );
}
