import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const vendorKey = new TextEncoder().encode(process.env.VENDOR_SESSION_SECRET_KEY);
const buyerKey = new TextEncoder().encode(process.env.BUYER_SESSION_SECRET_KEY);

const LOCATION_COOKIE_NAME = "user_location";

function getClientIp(request) {
   const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip");

   if (!ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
      return null;
   }

   return ip;
}

const setLocationCookie = (response, location) => {
   response.cookies.set(LOCATION_COOKIE_NAME, JSON.stringify(location), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
   });
};

const getLocationCookie = (request) => {
   const cookie = request.cookies.get(LOCATION_COOKIE_NAME)?.value;
   if (!cookie) return null;

   try {
      return JSON.parse(cookie);
   } catch {
      return null;
   }
};

async function getLocation(request) {
   const ip = getClientIp(request);
   if (!process.env.IPINFO_TOKEN) {
      return { country_code: "NG" };
   }

   try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const response = await fetch(`https://api.ipinfo.io/lite/${ip || "me"}?token=${process.env.IPINFO_TOKEN}`, {
         signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
         return { country_code: "NG" };
      }

      const data = await response.json();
      if (!data?.country_code) return { country_code: "NG" };

      return data;
   } catch {
      return { country_code: "NG" };
   }
}

export default async function middleware(request) {
   const pathname = request.nextUrl.pathname;
   const requestHeaders = new Headers(request.headers);

   // Never block internal dashboard/ecosystem/marketplace RSC navigations or prefetches on external IP lookup
   const isDashboardOrPortal =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/ecosystem") ||
      pathname.startsWith("/marketplace") ||
      pathname.startsWith("/onboarding") ||
      request.headers.get("rsc") === "1" ||
      Boolean(request.headers.get("next-router-prefetch"));

   const existingLocation = getLocationCookie(request);
   const countryData =
      existingLocation ||
      (isDashboardOrPortal ? { country_code: "NG" } : await getLocation(request));

   requestHeaders.set("x-pathname", pathname);
   if (pathname.startsWith("/dashboard/super-admin")) {
      requestHeaders.set("x-active-workspace", "super-admin");
   } else if (pathname.startsWith("/marketplace")) {
      requestHeaders.set("x-active-workspace", "marketplace");
   } else if (pathname.startsWith("/ecosystem")) {
      requestHeaders.set("x-active-workspace", "ecosystem");
   }

   if (countryData) {
      requestHeaders.set("x-user-location", JSON.stringify(countryData));
      requestHeaders.set("x-user-country", countryData.country_code);
   }

   const response = NextResponse.next({
      request: {
         headers: requestHeaders,
      },
   });

   if (countryData && !existingLocation) {
      setLocationCookie(response, countryData);
   }

   try {
      // ─── SUPER-ADMIN DASHBOARD PROTECTION ───
      // Requires vendor-session JWT with role "super admin" or "admin"
      if (pathname.startsWith("/dashboard/super-admin")) {
         const token =
            request.cookies.get("vendor-session")?.value ||
            request.cookies.get("ecosystem-session")?.value;

         if (!token) {
            const loginUrl = new URL("/auth/signin", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
         }

         try {
            const { payload } = await jwtVerify(token, vendorKey);
            const userRole = payload.role?.toLowerCase();

            // Only super admin and admin roles can access the super-admin dashboard
            if (userRole !== "super admin" && userRole !== "admin") {
               return NextResponse.redirect(new URL("/", request.url));
            }
         } catch (jwtError) {
            console.error("Middleware: Super-admin JWT verification failed:", jwtError.message);
            const loginUrl = new URL("/auth/signin", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
         }
      }

      // ─── BUYER DASHBOARD PROTECTION ───
      // Requires buyer-session JWT
      if (pathname.startsWith("/dashboard/buyer")) {
         const token = request.cookies.get("buyer-session")?.value;

         if (!token) {
            const loginUrl = new URL("/auth/signin", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
         }

         try {
            await jwtVerify(token, buyerKey);
         } catch (jwtError) {
            console.error("Middleware: Buyer dashboard JWT verification failed:", jwtError.message);
            const loginUrl = new URL("/auth/signin", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
         }
      }

      // ─── ONBOARDING PROTECTION ───
      // Requires a valid vendor-session JWT (any vendor role)
      if (pathname.startsWith("/onboarding")) {
         const token =
            request.cookies.get("vendor-session")?.value ||
            request.cookies.get("ecosystem-session")?.value;

         if (!token) {
            const loginUrl = new URL("/auth/signin", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
         }

         try {
            await jwtVerify(token, vendorKey);
         } catch (jwtError) {
            console.error("Middleware: Onboarding JWT verification failed:", jwtError.message);
            const loginUrl = new URL("/auth/signin", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
         }
      }

      // ─── VENDOR PROTECTION (marketplace & ecosystem) ───
      if (pathname.startsWith("/marketplace") || pathname.startsWith("/ecosystem")) {
         const token =
            request.cookies.get("vendor-session")?.value ||
            request.cookies.get("marketplace-session")?.value ||
            request.cookies.get("ecosystem-session")?.value;

         if (!token) {
            const loginUrl = new URL("/auth/signin", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
         }

         try {
            const { payload } = await jwtVerify(token, vendorKey);

            const marketplaceRoleRoutes = {
               seller: "/marketplace/store",
               farmer: "/marketplace/store",
               logistics: "/marketplace/logistics",
               "logistics partner": "/marketplace/logistics",
               logistic: "/marketplace/logistics",
               "logistics supplier": "/marketplace/logistics",
               "storage facility": "/marketplace/storage-facility",
               storage_facility: "/marketplace/storage-facility",
               storage: "/marketplace/storage-facility",
               "storage supplier": "/marketplace/storage-facility",
               trainer: "/marketplace/trainer",
               drone: "/marketplace/drone",
               "farm development": "/marketplace/farm-development",
            };

            if (pathname.startsWith("/marketplace")) {
               const allowedMarketplaceRoute = marketplaceRoleRoutes[payload.role?.toLowerCase()];
               if (allowedMarketplaceRoute) {
                  if (pathname === "/marketplace" || pathname === "/marketplace/") {
                     return NextResponse.redirect(new URL(allowedMarketplaceRoute, request.url));
                  }
                  if (!pathname.startsWith(allowedMarketplaceRoute)) {
                     return NextResponse.redirect(new URL(allowedMarketplaceRoute, request.url));
                  }
               }
            }

            // Role-Based Protection for Ecosystem Routes
            if (pathname.startsWith("/ecosystem")) {
               const ecosystemRoleRoutes = {
                  government: "/ecosystem/institution",
                  bank: "/ecosystem/institution",
                  ngo: "/ecosystem/institution",
                  dfi: "/ecosystem/institution",
                  "insurance firm": "/ecosystem/institution",
                  "commodity board": "/ecosystem/institution",
                  finance: "/ecosystem/institution",
                  "producer association": "/ecosystem/institution",
                  cooperative: "/ecosystem/institution",
                  "research institution": "/ecosystem/institution",
                  distributor: "/ecosystem/distributor",
                  "program director": "/ecosystem/program-management",
                  "regional manager": "/ecosystem/program-management",
                  "cluster supervisor": "/ecosystem/program-management",
                  "field officer": "/ecosystem/field-operations",
                  agronomist: "/ecosystem/field-operations",
                  inspector: "/ecosystem/field-operations",
                  enumerator: "/ecosystem/field-operations",
                  farmer: "/ecosystem/farmer",
                  exporter: "/ecosystem/buyer-partner",
                  "off-taker": "/ecosystem/buyer-partner",
                  "warehouse buyer": "/ecosystem/buyer-partner",
                  processor: "/ecosystem/buyer-partner",
                  "logistics partner": "/ecosystem/logistics",
                  logistics: "/ecosystem/logistics",
                  logistic: "/ecosystem/logistics",
                  "logistics supplier": "/ecosystem/logistics",
                  aggregator: "/ecosystem/aggregator",
                  "sales manager": "/ecosystem/sales-&-distribution",
                  "logistics coordinator": "/ecosystem/sales-&-distribution",
                  "warehouse supervisor": "/ecosystem/sales-&-distribution",
                  "data analyst": "/ecosystem/intelligence-&-monitoring",
                  "satellite monitor": "/ecosystem/intelligence-&-monitoring",
                  "field auditor": "/ecosystem/intelligence-&-monitoring",
                  storage: "/ecosystem/storage",
                  "storage facility": "/ecosystem/storage",
                  storage_facility: "/ecosystem/storage",
                  "storage supplier": "/ecosystem/storage",
               };

               const userRole = payload.role?.toLowerCase();

               // Redirect admin / super admin accessing ecosystem to super admin dashboard
               if (userRole === "super admin" || userRole === "admin") {
                  if (pathname === "/ecosystem" || pathname === "/ecosystem/" || pathname.startsWith("/ecosystem/admin") || pathname.startsWith("/ecosystem/super-admin")) {
                     return NextResponse.redirect(new URL("/dashboard/super-admin", request.url));
                  }
                  return response;
               }

               const allowedBaseRoute = ecosystemRoleRoutes[userRole];

               if (allowedBaseRoute) {
                  // Redirect root /ecosystem to their specific dashboard
                  if (pathname === "/ecosystem" || pathname === "/ecosystem/") {
                     return NextResponse.redirect(new URL(allowedBaseRoute, request.url));
                  }
                  // Block access to other ecosystem routes
                  else if (!pathname.startsWith(allowedBaseRoute)) {
                     return NextResponse.redirect(new URL(allowedBaseRoute, request.url));
                  }
               }
            }
         } catch (jwtError) {
            console.error("Middleware: JWT verification failed:", jwtError.message);
            const loginUrl = new URL("/auth/signin", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
         }
      }

      // ─── BUYER ROUTES PROTECTION (/buyer/*) ───
      if (pathname.startsWith("/buyer")) {
         const token = request.cookies.get("buyer-session")?.value;

         if (!token) {
            const loginUrl = new URL("/auth/signin", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
         }

         try {
            await jwtVerify(token, buyerKey);
         } catch (jwtError) {
            console.error("Middleware: Buyer JWT verification failed:", jwtError.message);
            const loginUrl = new URL("/auth/signin", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
         }
      }

      return response;
   } catch (error) {
      console.error("Middleware error:", error);
      return NextResponse.redirect(new URL("/", request.url));
   }
}

export const config = {
   matcher: ["/dashboard/:path*", "/marketplace/:path*", "/ecosystem/:path*", "/buyer/:path*", "/onboarding/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
