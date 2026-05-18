import { RegisterForm } from "@/app/auth/(buyerSpecific)/identification/register/registerForm";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
export const metadata = {
   title: "Register",
   description: "Register to create an account",
};

export default function Register() {
   return (
      <div className="max-w-sm mx-auto space-y-10 pt-10 text-start h-screen">
         <div className="flex items-center flex-col text-center">
            <Link href="/">
               <Image src="/favicon.ico" width={50} height={50} alt="Green Oria Logo" />
            </Link>
            <h1 className="text-2xl font-semibold">Welcome to Green Oria AgriConnect</h1>
         </div>
         <Suspense>
            <RegisterForm />
         </Suspense>
      </div>
   );
}
