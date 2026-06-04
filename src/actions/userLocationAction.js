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
