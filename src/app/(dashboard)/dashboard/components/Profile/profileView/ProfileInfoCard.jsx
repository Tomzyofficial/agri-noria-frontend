import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { BadgeCheck, Info, Camera } from "lucide-react";
import { FaUserAlt } from "react-icons/fa";

export function ProfileInfoCard({
   is_verified,
   vendor,
   loading,
   imageSrc,
   setOpenModal = false,
   handleProfileImageChange,
}) {
   return (
      <section className="bg-white dark:bg-(--card-dark) p-6 rounded-xl shadow-lg">
         <div className="flex justify-between gap-2 items-center mb-6 border-b border-gray-200 dark:border-gray-500 pb-4">
            <h2 className="font-semibold text-lg">Business Information</h2>
            {/* Verification Status Badge */}
            {is_verified ? (
               <Badge className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-normal bg-green-100 text-[#38a169] shadow-sm">
                  <BadgeCheck className="w-4 h-4" />
                  Verified
               </Badge>
            ) : (
               <Badge className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-normal bg-red-100 text-red-700 shadow-sm">
                  <Info className="w-4 h-4" />
                  Not Verified
               </Badge>
            )}
         </div>

         <div className="flex justify-end">
            <Button
               type="button"
               className="cursor-pointer py-1 px-2 rounded bg-(--primary)/20 text-(--primary) dark:text-[var(--primary)] dark:bg-green-100"
               onClick={() => setOpenModal(true)}
            >
               Edit profile
            </Button>
         </div>

         <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            {/* Profile Image */}
            <div className="relative w-30 h-30 flex-shrink-0">
               {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 animate-pulse rounded-full">
                     <div className="text-(--white-fff) text-sm">Loading...</div>
                  </div>
               ) : imageSrc && typeof imageSrc === "string" ? (
                  <Image
                     src={imageSrc}
                     loading="eager"
                     width={200}
                     height={200}
                     alt="Vendor profile image Preview"
                     className="rounded-full w-full h-full object-cover border-4 shadow-md"
                  />
               ) : (
                  <div className="rounded-full w-full h-full object-cover border-4 border-(--white-fff) shadow-md ">
                     <span className="flex items-center justify-center w-full h-full">
                        <FaUserAlt className="w-20 h-20 text-gray-500" />
                     </span>
                  </div>
               )}

               <Label
                  htmlFor="profile_image"
                  className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer transition duration-150 shadow-md shadow-black/40"
               >
                  <Camera />
               </Label>

               <Input
                  type="file"
                  onChange={handleProfileImageChange}
                  name="profile_image"
                  accept="image/*"
                  id="profile_image"
                  className="hidden"
               />
            </div>

            <div>
               {vendor?.business_name && vendor?.hot_line_phone_number && vendor?.address && vendor?.business_desc ? (
                  <div className="space-y-4">
                     <div>
                        <p className="text-[18px] font-[18px]">Store Name</p>
                        <p className="text-[14px] font-normal">{vendor?.business_name}</p>
                     </div>
                     <div>
                        <p className="text-[18px] font-[18px]">Phone Number</p>
                        <p className="text-[14px] font-normal">{vendor?.hot_line_phone_number}</p>
                     </div>
                     <div>
                        <p className="text-[18px] font-[18px]">Address</p>
                        <p className="text-[14px] font-normal">{vendor?.address}</p>
                     </div>
                     <div>
                        <p className="text-[18px] font-[18px]">Bio</p>
                        <p className="text-[14px] font-normal">{vendor?.business_desc}</p>
                     </div>
                  </div>
               ) : (
                  <p className="text-lg font-[18px]">No data available</p>
               )}
            </div>
         </div>
      </section>
   );
}
