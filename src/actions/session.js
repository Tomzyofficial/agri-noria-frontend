"use server";

import { cookies } from "next/headers";
import { apiUrl } from "@/_lib/api";

export const cookieStoreFnc = async () => {
   const cookieStore = await cookies();
   const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

   if (!cookieHeader) {
      return { authenticated: false };
   }
   return cookieHeader;
};

export async function verifyBuyerSession() {
   const cookieHeader = await cookieStoreFnc();
   try {
      const res = await fetch(apiUrl("/api/auth/verify-buyer"), {
         method: "GET",
         headers: {
            Cookie: cookieHeader,
         },
      });
      if (!res.ok) {
         return { authenticated: false };
      }
      const data = await res.json();
      return {
         authenticated: data.authenticated,
         buyerId: data.buyerId,
         email: data.email,
         name: data.name,
      };
   } catch (error) {
      return { authenticated: false };
   }
}

/**
 * Verify Vendor Session
 */
export async function verifyVendorSession() {
   const cookieHeader = await cookieStoreFnc();
   try {
      const res = await fetch(apiUrl("/api/auth/verify-vendor"), {
         method: "GET",
         headers: {
            Cookie: cookieHeader,
         },
      });

      if (!res.ok) {
         console.log("Vendor session verification failed with status:", res.status);
         return { authenticated: false };
      }

      const data = await res.json();
      return { authenticated: data.authenticated, ...data };
   } catch (err) {
      // console.error("Error:", err.message, err.stack);
      return { authenticated: false };
   }
}

export async function getCartFromCookie() {
   const cookieHeader = await cookieStoreFnc();
   try {
      const res = await fetch(apiUrl("/api/cart/get"), {
         method: "GET",
         cache: "no-store",
         headers: {
            cookie: cookieHeader,
         },
      });

      if (!res.ok) {
         if (res.status !== 404) {
            return [];
         }
         return [];
      }
      const data = await res.json();
      return Array.isArray(data.cart) ? data.cart : [];
   } catch (error) {
      return [];
   }
}

export async function setCartCookie(cart) {
   const cookieHeader = await cookieStoreFnc();
   if (!Array.isArray(cart)) {
      throw new Error("Cart must be an array");
   }

   try {
      const res = await fetch(apiUrl("/api/cart/set"), {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
         },
         body: JSON.stringify({ cart }),
      });

      const token = await res.json();

      if (res.ok && token) {
         const cookieStore = await cookies();
         cookieStore.set("cart-session", token, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: true,
            path: "/",
         });
      }
      return token;
   } catch {}
}
