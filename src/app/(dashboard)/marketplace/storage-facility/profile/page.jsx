import { verifyVendorSession } from "@/actions/session";
import { VendorProfilePage } from "@/components/dashboard/Profile/profileView/profile";
import { apiUrl } from "@/_lib/api";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { cookieStoreFnc } from "@/actions/session";
import { ErrorUi } from "@/components/ui/Error";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export const metadata = {
   title: "Dashboard Profile",
   description: "Vendor profile management",
};
async function checkVendorVerification() {
   const cookieHeader = await cookieStoreFnc();
   try {
      const res = await fetch(apiUrl("/api/vendor/verification"), {
         method: "GET",
         cache: "no-store",
         headers: {
            Cookie: cookieHeader,
         },
      });

      const result = await res.json();
      if (!res.ok) {
         return false;
      }
      return result.data;
   } catch {
      return false;
   }
}

async function getVendorProfileInfo() {
   const cookieHeader = await cookieStoreFnc();

   try {
      const res = await fetch(apiUrl("/api/vendor/get-profile-info"), {
         method: "GET",
         cache: "no-store",
         headers: {
            Cookie: cookieHeader,
         },
      });

      const result = await res.json();

      if (!res.ok || !result.data) {
         return {
            success: false,
            data: {
               rows: null,
               id_front_status: null,
               id_back_status: null,
               license_status: null,
               business_name: null,
               hot_line_phone_number: null,
               address: null,
               business_desc: null,
            },
         };
      }

      const payload = result.data?.data ? result.data.data : result.data;

      return {
         success: true,
         data: payload,
      };
   } catch (error) {
      console.error(error.message);
      return {
         success: false,
         data: {
            rows: null,
            id_front_status: null,
            id_back_status: null,
            license_status: null,
            business_name: null,
            hot_line_phone_number: null,
            address: null,
            business_desc: null,
         },
      };
   }
}

async function getProfileImage() {
   const cookieHeader = await cookieStoreFnc();

   try {
      const res = await fetch(apiUrl("/api/vendor/get-profile-image"), {
         method: "GET",
         cache: "no-store",
         headers: {
            Cookie: cookieHeader,
         },
      });

      const result = await res.json();
      if (!res.ok) {
         return null;
      }

      return result.data;
   } catch (error) {
      console.error(error.message);
      return null;
   }
}

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "storage")) {
      return <Unauthorized />;
   }

   try {
      const verify_status = await checkVendorVerification();
      const profileInfo = await getVendorProfileInfo();
      const getProfileImg = await getProfileImage();

      const isVerified = verify_status;
      const fullName = [session.fname, session.lname].filter(Boolean).join(" ").trim();
      const defaultBusinessName = fullName ? `${fullName} Enterprise` : "Agri-Noria Partner";

      return (
         <VendorProfilePage
            rows={profileInfo?.data?.rows || profileInfo?.data}
            license_status={profileInfo?.data?.license_status}
            id_front_status={profileInfo?.data?.id_front_status}
            id_back_status={profileInfo?.data?.id_back_status}
            is_verified={isVerified}
            initialVendor={{
               business_name: profileInfo?.data?.business_name || defaultBusinessName,
               hot_line_phone_number: profileInfo?.data?.hot_line_phone_number || session.phone || "",
               address: profileInfo?.data?.address || "Nigeria",
               business_desc: profileInfo?.data?.business_desc || "Storage Facility operating on the Agri-Noria platform.",
            }}
            initialProfileImg={getProfileImg}
         />
      );
   } catch (error) {
      console.log({ message: error.message, stack: error.stack });
      return <ErrorUi />;
   }
}
