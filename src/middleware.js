import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const vendorKey = new TextEncoder().encode(process.env.VENDOR_SESSION_SECRET_KEY);
const buyerKey = new TextEncoder().encode(process.env.BUYER_SESSION_SECRET_KEY);

/* async function getLocation() {
   try {
      const response = await fetch("https://api.ipinfo.io/lite/me?token=e9962c1b85a628", {
         next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (!response.ok) {
         console.log("Failed to fetch location data");
         return null;
      }

      const data = await response.json();
      return data;
   } catch (error) {
      console.error("Location lookup failed", error);
      return null;
   }
} */

export default async function middleware(request) {
   const pathname = request.nextUrl.pathname;

   // Get country data and add to response headers
   // const countryData = await getLocation();

   // const response = NextResponse.next();

   // // Add country data to response headers
   // if (countryData) {
   //    response.headers.set("X-User-Location", JSON.stringify(countryData));
   // }

   try {
      // VENDOR PROTECTION
      if (pathname.startsWith("/dashboard")) {
         const token = request.cookies.get("vendor-session")?.value;

         if (!token) {
            console.log("Middleware: No vendor session token found");
            return NextResponse.redirect(new URL("/", request.url));
         }

         try {
            await jwtVerify(token, vendorKey);
         } catch (jwtError) {
            console.error("Middleware: JWT verification failed:", jwtError.message);
            return NextResponse.redirect(new URL("/", request.url));
         }
      }

      // BUYER PROTECTION
      if (pathname.startsWith("/buyer")) {
         const token = request.cookies.get("buyer-session")?.value;

         if (!token) {
            console.log("Middleware: No buyer session token found");
            return NextResponse.redirect(new URL("/", request.url));
         }

         try {
            await jwtVerify(token, buyerKey);
         } catch (jwtError) {
            console.error("Middleware: Buyer JWT verification failed:", jwtError.message);
            return NextResponse.redirect(new URL("/", request.url));
         }
      }

      return NextResponse.next();
   } catch (error) {
      console.error("Middleware error:", error);
      return NextResponse.redirect(new URL("/", request.url));
   }
}

export const config = {
   matcher: ["/dashboard/:path*", "/buyer/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
