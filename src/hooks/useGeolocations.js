/* "use client";
import { useEffect, useState } from "react";

export function useGeoLocation() {
   const [location, setLocation] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const storedLocation = localStorage.getItem("user-location");
      if (storedLocation) {
         const parsed = JSON.parse(storedLocation);
         setLocation(parsed);
         setLoading(false);
         return;
      }

      const getCountryFromHeaders = async () => {
         try {
            const response = await fetch(`https://api.ipinfo.io/lite/me?token=${process.env.NEXT_PUBLIC_IPINFO_TOKEN}`);
            if (!response.ok) {
               return;
            }
            const data = await response.json();
            localStorage.setItem("user-location", JSON.stringify(data));
            setLocation(data);
         } catch (error) {
            console.error("Failed to get location from headers:", error);
         } finally {
            setLoading(false);
         }
      };

      getCountryFromHeaders();
   }, []);

   return { location, loading };
} */

"use client";
import { useEffect, useState } from "react";
import { getUserLocation, setUserLocation } from "@/actions/userLocationInfo";

export function useGeoLocation() {
   const [location, setLocation] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const userLocationInfo = async () => {
         const getLoc = await getUserLocation();
         if (getLoc) {
            setLocation(getLoc);
            return;
         }
         try {
            const userLocation = await getUserLocationFnc();
            await setUserLocation(userLocation);
            setLocation(userLocation);
         } catch (error) {
            console.error("Failed to get location from headers:", error);
         } finally {
            setLoading(false);
         }
      };

      userLocationInfo();
   }, []);

   return { location, loading };
}

async function getUserLocationFnc() {
   try {
      const response = await fetch(`https://api.ipinfo.io/lite/me?token=${process.env.NEXT_PUBLIC_IPINFO_TOKEN}`, {
         next: { revalidate: 3600 }, // Cache for 1 hour
      });
      if (!response.ok) return null;

      const data = await response.json();
      return data;
   } catch (error) {
      console.error("Fallback location detection failed:", error);
      return null;
   }
}
