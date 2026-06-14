import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const vendorKey = new TextEncoder().encode(
  process.env.VENDOR_SESSION_SECRET_KEY,
);
const buyerKey = new TextEncoder().encode(process.env.BUYER_SESSION_SECRET_KEY);

const LOCATION_COOKIE_NAME = "user_location";

const setLocationCookie = (response, location) => {
  response.cookies.set(LOCATION_COOKIE_NAME, JSON.stringify(location), {
    httpOnly: true,
    secure: true,
    sameSite: "none",
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

async function getLocation() {
  if (!process.env.NEXT_PUBLIC_IPINFO_TOKEN) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.ipinfo.io/lite/me?token=${process.env.NEXT_PUBLIC_IPINFO_TOKEN}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    );

    if (!response.ok) {
      console.log("Failed to fetch location data");
      return null;
    }

    const data = await response.json();
    if (!data?.country_code) return null;

    return data;
  } catch (error) {
    console.error("Location lookup failed", error);
    return null;
  }
}

export default async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  const existingLocation = getLocationCookie(request);
  const shouldDetectLocation = pathname === "/" && !existingLocation;
  const countryData =
    existingLocation || (shouldDetectLocation ? await getLocation() : null);

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
    // VENDOR PROTECTION
    if (
      pathname.startsWith("/marketplace") ||
      pathname.startsWith("/ecosystem")
    ) {
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
        console.error(
          "Middleware: Buyer JWT verification failed:",
          jwtError.message,
        );
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    "/marketplace/:path*",
    "/ecosystem/:path*",
    "/buyer/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
