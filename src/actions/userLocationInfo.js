"use server";

import { cookies } from "next/headers";

export async function getUserLocation() {
   const cookieStore = await cookies();
   const locationCookie = cookieStore.get("user_location");

   if (locationCookie) {
      try {
         return JSON.parse(locationCookie.value);
      } catch (error) {
         console.error("Failed to parse location cookie:", error);
         return null;
      }
   }

   return null;
}

export async function setUserLocation(locationData) {
   const cookieStore = await cookies();
   cookieStore.set("user_location", JSON.stringify(locationData), {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
   });
   return true;
}
