"use client";
/**************** React hooks  ******************/
import { useState, useEffect } from "react";
import useSWR from "swr";
/**************** Components  ******************/
import { Modal } from "@/components/ui/Modal";
import { VendorProfileEdit } from "@/app/(dashboard)/dashboard/components/Profile/editProfile/editProfile";
import { toast } from "react-toastify";
import { ProfileInfoCard } from "@/app/(dashboard)/dashboard/components/Profile/profileView/ProfileInfoCard";
import { Ratings } from "@/app/(dashboard)/dashboard/components/Profile/profileView/Ratings";
import { KycVerification } from "@/app/(dashboard)/dashboard/components/Profile/profileView/KycVerification";
import { QuickAction } from "@/app/(dashboard)/dashboard/components/Profile/profileView/QuickAction";
import { useRouter } from "next/navigation";

export function VendorProfilePage({
   rows,
   license_status,
   id_front_status,
   id_back_status,
   is_verified,
   initialVendor,
   initialProfileImg,
}) {
   const [openModal, setOpenModal] = useState(false);
   const [imageSrc, setImageSrc] = useState(initialProfileImg);
   const [vendor, setVendor] = useState(initialVendor);
   const [loading, setLoading] = useState(false);
   const router = useRouter();
   const handleProfileEdit = (updated) => {
      setVendor((prev) => ({ ...prev, ...updated }));
   };

   const handleProfileImageChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.match("image.*")) {
         toast.error("Please select a valid image file");
         return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
         toast.error("Image size should be less than 5MB");
         return;
      }

      setLoading(true);
      try {
         const formData = new FormData();
         formData.append("profile_image", file);

         const response = await fetch("/api/proxy/vendor/upload-profile-image", {
            method: "PATCH",
            body: formData,
         });

         const result = await response.json();

         if (!response.ok || !result.success) {
            throw new Error(result.error || "Failed to upload image");
         }

         setImageSrc(result.data);
         toast.success(result.message);
         router.refresh();
      } catch (error) {
         toast.error(error.message || "Failed to upload profile image");
      } finally {
         setLoading(false);
      }
   };

   const fetcher = async (url) => {
      try {
         const response = await fetch(url, {
            method: "GET",
         });

         if (!response.ok) {
            throw new Error("Failed to fetch data");
         }
         const data = await response.json();
         return data;
      } catch (error) {
         return null;
      }
   };

   // Fetch ratings breakdown for the vendor
   const {
      isLoading: ratingsLoading,
      data: ratingsData,
      error: ratingsError,
   } = useSWR("/api/proxy/vendor/product-ratings", fetcher);

   // Initialize ratings state with default values
   const [ratings, setRatings] = useState({
      total: 0,
      average: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
   });

   // Update ratings when data is fetched
   useEffect(() => {
      if (ratingsData?.success && ratingsData?.data) {
         setRatings({
            total: ratingsData.data.total || 0,
            average: ratingsData.data.average || 0,
            breakdown: ratingsData.data.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
         });
      }
   }, [ratingsData]);

   return (
      <>
         <main className="my-25 lg:my-5">
            {/* Modal form for profile edit */}
            <Modal isOpen={openModal} onClick={() => setOpenModal(false)}>
               <VendorProfileEdit onProfileEdit={handleProfileEdit} />
            </Modal>
            {/* Dashboard Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* LEFT COLUMN: Profile & Identity (Wider on Desktop) */}
               <div className="lg:col-span-2 space-y-8">
                  {/* 1. Profile Information Card */}
                  <ProfileInfoCard
                     is_verified={is_verified}
                     vendor={vendor}
                     loading={loading}
                     imageSrc={imageSrc}
                     setOpenModal={setOpenModal}
                     handleProfileImageChange={handleProfileImageChange}
                  />

                  {/* 2. Performance Metrics (Simulated Stats) */}
                  <Ratings ratingsLoading={ratingsLoading} ratingsError={ratingsError} ratings={ratings} />
               </div>

               {/* RIGHT COLUMN: KYC & Security (Sidebar style) */}
               <div className="lg:col-span-1 space-y-8">
                  {/* 3. KYC (Know Your Customer) Verification Card */}
                  <KycVerification
                     is_verified={is_verified}
                     rows={rows}
                     license_status={license_status}
                     id_front_status={id_front_status}
                     id_back_status={id_back_status}
                  />

                  {/* 4. Quick Actions / Support */}
                  <QuickAction />
               </div>
            </div>
         </main>
      </>
   );
}
