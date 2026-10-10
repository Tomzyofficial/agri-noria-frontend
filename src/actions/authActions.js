"use server";
import { apiUrl } from "@/_lib/api";
import { cookies } from "next/headers";

/***************** Vendor side ******************/
export async function signinBridge(credentials) {
   try {
      const res = await fetch(apiUrl("/api/auth/vendor/sign-in"), {
         body: JSON.stringify(credentials),
         method: "POST",
         headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
         return {
            success: false,
            error: data.error,
         };
      }

      const cookieStore = await cookies();
      const cookieOptions = {
         httpOnly: true,
         secure: true,
         sameSite: "none",
         path: "/",
      };
      cookieStore.set("vendor-session", data.user.token, cookieOptions);
      cookieStore.set("marketplace-session", data.user.token, cookieOptions);
      cookieStore.set("ecosystem-session", data.user.token, cookieOptions);

      return { success: true };
   } catch (error) {
      return { success: false, error: "Internal server error. Try again later." };
   }
}

export async function registerBridge(credentials) {
   try {
      const { accountType, ...registrationPayload } = credentials;

      const res = await fetch(apiUrl("/api/auth/vendor/register"), {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(registrationPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) return { success: false, error: data.error };

      const cookieStore = await cookies();
      const cookieOptions = {
         httpOnly: true,
         secure: true,
         sameSite: "none",
         path: "/",
      };
      cookieStore.set("vendor-session", data.user.token, cookieOptions);
      cookieStore.set("marketplace-session", data.user.token, cookieOptions);
      cookieStore.set("ecosystem-session", data.user.token, cookieOptions);

      return { success: true };
   } catch (error) {
      console.error("RegisterBridge error:", error);
      return { success: false, error: "Internal server error. Try again later." };
   }
}

export async function signoutBridge() {
   const cookieStore = await cookies();

   cookieStore.delete("vendor-session");
   cookieStore.delete("marketplace-session");
   cookieStore.delete("ecosystem-session");

   const backend = await fetch(apiUrl("/api/auth/vendor/signout"), {
      method: "POST",
   });

   if (!backend.ok) {
      return false;
   }
   return true;
}

/********************** Buyer side *******************/
export async function buyerSigninBridge(credentials) {
   try {
      const res = await fetch(apiUrl("/api/auth/buyer/signin"), {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
         return { success: false, error: data.error };
      }

      const cookieStore = await cookies();
      cookieStore.set("buyer-session", data.token, {
         httpOnly: true,
         secure: true,
         sameSite: "none",
         path: "/",
         // maxAge: 60 * 60 * 24, // 1 day
      });

      return { success: true, buyerId: data.buyerId };
   } catch (error) {
      return { success: false, error: "Internal server error. Try again later." };
   }
}

export async function buyerRegisterBridge(credentials) {
   try {
      const { accountType, ...registrationPayload } = credentials;

      const res = await fetch(apiUrl("/api/auth/buyer/register"), {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(registrationPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) return { success: false, error: data.error };

      const cookieStore = await cookies();
      cookieStore.set("buyer-session", data.token, {
         httpOnly: true,
         secure: true,
         sameSite: "none",
         path: "/",
         // maxAge: 60 * 60 * 24, // 1 day
      });

      return { success: true, buyerId: data.token.buyer_id };
   } catch (error) {
      return { success: false, error: "Internal server error. Try again later." };
   }
}

export async function buyerSignoutBridge() {
   const cookieStore = await cookies();
   cookieStore.delete("buyer-session");
   cookieStore.delete("cart-session");
   const backend = await fetch(apiUrl("/api/auth/buyer/signout"), {
      method: "POST",
   });
   if (!backend.ok) {
      return false;
   }
   return true;
}
