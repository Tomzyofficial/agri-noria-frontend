import { SigninForm } from "@/app/auth/(buyerSpecific)/identification/signin/signinForm";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Sign in",
  description: "Sign in to access your account",
};

export default function Signin() {
  return (
    <div className="max-w-sm mx-auto space-y-10 pt-10 text-start h-screen">
      <div className="flex items-center flex-col text-center">
        <Link href="/">
          <Image
            src="/favicon.ico"
            width={50}
            height={50}
            alt="Green Oria Logo"
          />
        </Link>
        <h1 className="text-2xl font-semibold">Welcome to Green-Oria</h1>
      </div>
      <Suspense>
        <SigninForm />
      </Suspense>
    </div>
  );
}
