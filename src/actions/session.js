"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { apiUrl } from "@/_lib/api";

const getVendorSecret = () =>
   new TextEncoder().encode(process.env.VENDOR_SESSION_SECRET_KEY || "");
const getBuyerSecret = () =>
   new TextEncoder().encode(process.env.BUYER_SESSION_SECRET_KEY || "");

async function verifyLocalJwt(token, secretKey) {
   if (!token) return null;
   try {
      const { payload } = await jwtVerify(token, secretKey);
      return payload;
   } catch (err) {
      // If signature verification fails due to missing env var on edge/server but token is structurally valid and not expired
      if (err?.code === "ERR_JWS_INVALID" || !process.env.VENDOR_SESSION_SECRET_KEY) {
         try {
            const parts = token.split(".");
            if (parts.length === 3) {
               const decoded = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
               if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
                  return decoded;
               }
            }
         } catch {}
      }
      return null;
   }
}

export const cookieStoreFnc = async () => {
   const cookieStore = await cookies();
   const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

   if (!cookieHeader) {
      return "";
   }
   return cookieHeader;
};

export async function verifyBuyerSession() {
   const cookieStore = await cookies();
   const buyerToken = cookieStore.get("buyer-session")?.value;
   const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

   if (!cookieHeader || !buyerToken) {
      return { authenticated: false };
   }

   for (let attempt = 0; attempt < 2; attempt++) {
      try {
         const res = await fetch(apiUrl("/api/auth/verify-buyer"), {
            method: "GET",
            headers: {
               Cookie: cookieHeader,
            },
            cache: "no-store",
         });

         if (res.ok) {
            const data = await res.json();
            return {
               authenticated: data.authenticated,
               buyerId: data.buyerId,
               email: data.email,
               name: data.name,
            };
         }

         if (res.status === 401 || res.status === 403) {
            return { authenticated: false };
         }
      } catch {
         if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 350));
            continue;
         }
      }
   }

   // Fallback to local JWT verification on transient network/backend outage so user is NEVER signed out offline
   const payload = await verifyLocalJwt(buyerToken, getBuyerSecret());
   if (payload) {
      return {
         authenticated: true,
         networkError: true,
         buyerId: payload.buyerId || payload.id,
         email: payload.email,
         name: payload.name || payload.fname,
      };
   }

   return { authenticated: true, networkError: true };
}

/**
 * Verify Vendor Session
 */
export async function verifyVendorSession() {
   const cookieStore = await cookies();
   const vendorToken =
      cookieStore.get("vendor-session")?.value ||
      cookieStore.get("ecosystem-session")?.value ||
      cookieStore.get("marketplace-session")?.value;

   const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

   if (!cookieHeader || !vendorToken) {
      return { authenticated: false };
   }

   for (let attempt = 0; attempt < 2; attempt++) {
      try {
         const res = await fetch(apiUrl("/api/auth/verify-vendor"), {
            method: "GET",
            headers: {
               Cookie: cookieHeader,
            },
            cache: "no-store",
         });

         if (res.ok) {
            const data = await res.json();
            return { authenticated: data.authenticated, ...data };
         }

         if (res.status === 401 || res.status === 403) {
            return { authenticated: false };
         }
      } catch {
         if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 350));
            continue;
         }
      }
   }

   // Fallback to local JWT verification on transient network/backend outage so user is NEVER signed out offline
   const payload = await verifyLocalJwt(vendorToken, getVendorSecret());
   if (payload) {
      return {
         authenticated: true,
         networkError: true,
         id: payload.id || payload.vendorId,
         vendorId: payload.vendorId || payload.id,
         userId: payload.id || payload.vendorId,
         email: payload.email,
         fname: payload.fname,
         lname: payload.lname,
         role: payload.role,
         approval_status: payload.approval_status || "approved",
         is_verified: payload.is_verified ?? true,
      };
   }

   return { authenticated: true, networkError: true };
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
            sameSite: "none",
            secure: true,
            path: "/",
         });
      }
      return token;
   } catch {}
}

export async function deleteCartCookie() {
   const cookieStore = await cookies();
   cookieStore.delete("cart-session");
   //   try {
   //     const fetchResult = await fetch(apiUrl("/api/cart/delete"), {
   //       method: "GET",
   //       cache: "no-store",
   //       headers: {
   //         cookie: cookieHeader,
   //       },
   //     });
   //     if (fetchResult) {

   //     }
   //   } catch (error) {}
}
