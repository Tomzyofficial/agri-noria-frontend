"use server";
import { apiUrl } from "@/_lib/api";
import { cookies, headers } from "next/headers";

async function getFirstPartyCookieOptions(maxAge = 7 * 24 * 60 * 60) {
   let isHttps = process.env.NODE_ENV === "production";
   try {
      const h = await headers();
      const proto = h.get("x-forwarded-proto") || "";
      const origin = h.get("origin") || h.get("referer") || "";
      const host = h.get("host") || "";
      if (proto) {
         isHttps = proto.includes("https");
      } else if (
         origin.startsWith("http://") ||
         host.startsWith("localhost") ||
         host.startsWith("127.0.0.1")
      ) {
         isHttps = false;
      }
   } catch {}

   return {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge,
   };
}

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
      const cookieOptions = await getFirstPartyCookieOptions(
         credentials?.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60
      );
      cookieStore.set("vendor-session", data.user.token, cookieOptions);
      cookieStore.set("marketplace-session", data.user.token, cookieOptions);
      cookieStore.set("ecosystem-session", data.user.token, cookieOptions);

      return { success: true };
   } catch (error) {
      console.error("SigninBridge error:", error);
      return { success: false, error: error?.message || "Internal server error. Try again later." };
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
      const cookieOptions = await getFirstPartyCookieOptions(7 * 24 * 60 * 60);
      cookieStore.set("vendor-session", data.user.token, cookieOptions);
      cookieStore.set("marketplace-session", data.user.token, cookieOptions);
      cookieStore.set("ecosystem-session", data.user.token, cookieOptions);

      return { success: true };
   } catch (error) {
      console.error("RegisterBridge error:", error);
      return { success: false, error: error?.message || "Internal server error. Try again later." };
   }
}

export async function signoutBridge() {
   const cookieStore = await cookies();

   cookieStore.delete("vendor-session");
   cookieStore.delete("marketplace-session");
   cookieStore.delete("ecosystem-session");

   try {
      await fetch(apiUrl("/api/auth/vendor/signout"), {
         method: "POST",
      });
   } catch {
      // Ignore backend connection failure when clearing session cookies locally
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
      const cookieOptions = await getFirstPartyCookieOptions(7 * 24 * 60 * 60);
      cookieStore.set("buyer-session", data.token, cookieOptions);

      return { success: true, buyerId: data.buyerId };
   } catch (error) {
      console.error("BuyerSigninBridge error:", error);
      return { success: false, error: error?.message || "Internal server error. Try again later." };
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
      const cookieOptions = await getFirstPartyCookieOptions(7 * 24 * 60 * 60);
      cookieStore.set("buyer-session", data.token, cookieOptions);

      return { success: true, buyerId: data.token.buyer_id };
   } catch (error) {
      console.error("BuyerRegisterBridge error:", error);
      return { success: false, error: error?.message || "Internal server error. Try again later." };
   }
}

export async function buyerSignoutBridge() {
   const cookieStore = await cookies();
   cookieStore.delete("buyer-session");
   cookieStore.delete("cart-session");
   try {
      await fetch(apiUrl("/api/auth/buyer/signout"), {
         method: "POST",
      });
   } catch {}
   return true;
}
