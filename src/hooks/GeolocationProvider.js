"use client";
import { useGeoLocation } from "./useGeolocations.js";

export function GeoLocationProvider({ children }) {
   const { location, loading } = useGeoLocation();

   if (loading) {
      return <>{children}</>; // Don't block rendering while loading
   }

   return <>{children}</>;
}
