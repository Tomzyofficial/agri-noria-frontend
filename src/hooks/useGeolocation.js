"use client";
import { useEffect, useState } from "react";
import { getUserLocation } from "@/actions/not-in-use-userLocationAction";

export function useGeoLocation() {
   const [location, setLocation] = useState(null);

   useEffect(() => {
      const userLocationInfo = async () => {
         const getLoc = await getUserLocation();
         if (getLoc) {
            setLocation(getLoc);
            return;
         }
      };

      userLocationInfo();
   }, []);

   return { location };
}
