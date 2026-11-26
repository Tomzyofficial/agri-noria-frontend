import { NextResponse } from "next/server";
import { apiUrl } from "@/_lib/api";

export async function POST(req) {
   try {
      const credentials = await req.json();
      const res = await fetch(apiUrl("/api/auth/vendor/sign-in"), {
         body: JSON.stringify(credentials),
         method: "POST",
         headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
         return NextResponse.json(
            {
               success: false,
               error: data.error || "Failed to login",
            },
            { status: res.status || 400 }
         );
      }

      const proto =
         req.headers.get("x-forwarded-proto") ||
         req.nextUrl?.protocol ||
         "";
      const isHttps =
         proto.includes("https") ||
         (req.headers.get("origin") || "").startsWith("https://");

      const response = NextResponse.json({ success: true, user: data.user });
      const cookieOptions = {
         httpOnly: true,
         secure: isHttps,
         sameSite: "lax",
         path: "/",
         maxAge: credentials.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
      };

      response.cookies.set("vendor-session", data.user.token, cookieOptions);
      response.cookies.set("marketplace-session", data.user.token, cookieOptions);
      response.cookies.set("ecosystem-session", data.user.token, cookieOptions);

      return response;
   } catch (error) {
      console.error("Route /api/auth/signin error:", error);
      return NextResponse.json(
         { success: false, error: "Internal server error. Try again later." },
         { status: 500 }
      );
   }
}
