"use client";
import Link from "next/link";
import Image from "next/image";

export default function EmptyCart() {
   return (
      <div>
         <div className="bg-(--white-fff) dark:bg-(--card-dark) h-90 max-w-6xl mx-auto m-4 md:m-10 flex flex-col justify-center items-center space-y-5 rounded-md">
            <Image src="/images/cart.svg" width={100} height={100} alt="Cart image for empty cart page" />
            <h1 className="font-semibold">Your cart is empty. </h1>
            <p>Browse our marketplace and discover our best deals!</p>
            <Link
               href="/"
               className="bg-(--greenish-color) text-(--white-fff) dark:text-(--foreground) p-2 rounded hover:bg-(--dark-green-color) transition transition-background focus:bg-(--dark-green-color)"
            >
               Browse now
            </Link>
         </div>
      </div>
   );
}
