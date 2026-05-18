import NavBarClient from "@/components/ui/NavBar/NavBarClient";
import { verifyBuyerSession, verifyVendorSession, getCartFromCookie } from "@/actions/session";

export default async function NavBar() {
   const buyerUser = await verifyBuyerSession();
   const vendorUser = await verifyVendorSession();

   // Use whichever session is authenticated (vendor/ecosystem takes priority)
   let user;
   if (vendorUser?.authenticated) {
      user = {
         authenticated: true,
         buyerId: vendorUser.userId,
         name: `${vendorUser.fname || ""} ${vendorUser.lname || ""}`.trim(),
         email: vendorUser.email,
         account_type: vendorUser.account_type,
         isVendor: true,
      };
   } else {
      user = buyerUser;
   }

   const cartItems = await getCartFromCookie();
   const initialCartCount = Array.isArray(cartItems)
      ? cartItems.reduce((total, item) => total + (item.quantity || 1), 0)
      : 0;
   return <NavBarClient user={user} initialCartCount={initialCartCount} />;
}
