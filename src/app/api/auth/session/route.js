import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { apiUrl } from "@/_lib/api";

const getVendorSecret = () =>
   new TextEncoder().encode(process.env.VENDOR_SESSION_SECRET_KEY || "");

async function verifyLocalVendorToken(token) {
   if (!token) return null;
   try {
      const { payload } = await jwtVerify(token, getVendorSecret());
      return payload;
   } catch {
      try {
         const parts = token.split(".");
         if (parts.length === 3) {
            const decoded = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
            if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
               return decoded;
            }
         }
      } catch {}
      return null;
   }
}

export async function GET() {
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
      return NextResponse.json({ authenticated: false });
   }

   for (let attempt = 0; attempt < 2; attempt++) {
      try {
         const res = await fetch(apiUrl("/api/auth/verify-vendor"), {
            method: "GET",
            headers: { Cookie: cookieHeader },
            cache: "no-store",
         });

         if (res.ok) {
            const data = await res.json();
            return NextResponse.json({ authenticated: data.authenticated, ...data });
         }

         if (res.status === 401 || res.status === 403) {
            return NextResponse.json({ authenticated: false });
         }
      } catch (error) {
         if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 350));
            continue;
         }
         console.warn("Route /api/auth/session transient network fallback:", error?.message);
      }
   }

   const payload = await verifyLocalVendorToken(vendorToken);
   if (payload) {
      return NextResponse.json({
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
      });
   }

   return NextResponse.json({ authenticated: true, networkError: true });
}
