import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiUrl } from "@/_lib/api";

export async function GET() {
   try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore
         .getAll()
         .map((c) => `${c.name}=${c.value}`)
         .join("; ");

      if (!cookieHeader) {
         return NextResponse.json({ authenticated: false });
      }

      const res = await fetch(apiUrl("/api/auth/verify-vendor"), {
         method: "GET",
         headers: { Cookie: cookieHeader },
         cache: "no-store",
      });

      if (!res.ok) {
         return NextResponse.json({ authenticated: false });
      }

      const data = await res.json();
      return NextResponse.json({ authenticated: data.authenticated, ...data });
   } catch (error) {
      console.error("Route /api/auth/session error:", error);
      return NextResponse.json({ authenticated: false });
   }
}
