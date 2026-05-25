import { RegisterForm } from "./registerForm";
import { verifyVendorSession } from "@/actions/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Register",
  description: "Register to create an account",
};

export default async function RegisterPage() {
  // const session = await verifyVendorSession();
  // const { workspace } = session;
  // if (session.authenticated) {
  //    redirect(`/${workspace}/dashboard`);
  // }
  return (
    <div>
      <RegisterForm />
    </div>
  );
}
