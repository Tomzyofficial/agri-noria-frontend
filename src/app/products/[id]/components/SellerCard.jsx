import Image from "next/image";
import { FaUserAlt } from "react-icons/fa";
import { BadgeCheck, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function SellerCard({ product }) {
   return (
      <div className="bg-(--white-fff) dark:bg-(--card-dark) flex gap-3 rounded-md text-(--foreground) mt-4 p-3">
         <div className="relative w-15 h-15 flex-shrink-0">
            {product?.profile_image_url ? (
               <Image
                  src={product?.profile_image_url}
                  width={200}
                  height={200}
                  alt="Vendor profile image Preview"
                  className="rounded-full w-full h-full object-cover border-4 shadow-md"
               />
            ) : (
               <div className="rounded-full w-full h-full object-cover border-4 border-(--white-fff) shadow-md ">
                  <span className="flex items-center justify-center w-full h-full">
                     <FaUserAlt className="w-10 h-10 text-gray-500" />
                  </span>
               </div>
            )}
         </div>

         <div>
            <p>
               {product?.fname.charAt(0).toUpperCase() +
                  product?.fname.slice(1) +
                  " " +
                  product?.lname.charAt(0).toUpperCase() +
                  product?.lname.slice(1)}
            </p>
            {product?.is_verified ? (
               <Badge className="flex items-center mb-2 gap-1 bg-green-100 text-[14px] text-green-700 px-2 py-0.8 rounded-full w-20">
                  <BadgeCheck className="w-4 h-4" />
                  Verified
               </Badge>
            ) : (
               <Badge className="flex items-center mb-2 gap-1 bg-red-100 text-[14px] text-red-700 px-2 py-0.8 rounded-full w-26">
                  <Info className="w-4 h-4" />
                  Not Verified
               </Badge>
            )}
            <p>{product?.phone}</p>
         </div>
      </div>
   );
}
