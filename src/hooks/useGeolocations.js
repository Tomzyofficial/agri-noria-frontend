"use client";
import { useEffect, useState, useRef } from "react";
import { getUserLocation, setUserLocation } from "@/actions/userLocationAction";

export function useGeoLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);
  const intervalRef = useRef(null);
  const lastKnownIpRef = useRef(null);

  // Function to check if location has changed
  const hasLocationChanged = (currentLocation, newLocation) => {
    if (!currentLocation || !newLocation) return true;

    // Check key location identifiers that would indicate a change
    const changedFields = ["ip", "country_code", "country", "as_name"];

    return changedFields.some((field) => currentLocation[field] !== newLocation[field]);
  };

  // Function to fetch and update location
  const checkAndUpdateLocation = async (forceUpdate = false) => {
    try {
      const currentLocation = await getUserLocation();
      const newLocation = await setUserLocationFnc();

      if (!newLocation) {
        if (currentLocation) {
          setLocation(currentLocation);
          setLoading(false);
        }
        return currentLocation;
      }

      // Check if location has changed or if forced update
      const locationChanged = hasLocationChanged(currentLocation, newLocation);

      if (locationChanged || forceUpdate) {
        await setUserLocation(newLocation);
        setLocation(newLocation);
        lastKnownIpRef.current = newLocation;

        // if (locationChanged) {
        //    console.log("Location updated:", {
        //       from: currentLocation?.ip || "unknown",
        //       to: newLocation.ip,
        //       country: newLocation.country,
        //       city: newLocation.city,
        //    });
        // }
      } else {
        setLocation(currentLocation);
        await setUserLocation(currentLocation);
      }

      setLastCheck(Date.now());
      return newLocation;
    } catch (error) {
      console.error("Failed to check location:", error);
      const fallback = await getUserLocation();
      if (fallback) setLocation(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial location check
    const initializeLocation = async () => {
      await checkAndUpdateLocation(true); // Force update on initial load
    };

    initializeLocation();

    // Set up periodic location checks (every 5 minutes) - DISABLED TEMPORARILY
    // intervalRef.current = setInterval(
    //    async () => {
    //       await checkAndUpdateLocation();
    //    },
    //    5 * 60 * 1000,
    // ); // 5 minutes

    // Set up visibility change listener to check when user returns to tab
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        // Check location when user becomes active again
        const timeSinceLastCheck = Date.now() - lastCheck;
        // Only check if it's been at least 1 minute since last check
        if (timeSinceLastCheck > 60 * 1000) {
          await checkAndUpdateLocation();
        }
      }
    };

    // Set up network change listener
    const handleNetworkChange = async () => {
      console.log("Network changed, checking location...");
      await checkAndUpdateLocation(true); // Force update on network change
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, []);

  // Manual location check function
  /*   const refreshLocation = async () => {
      setLoading(true);
      await checkAndUpdateLocation(true);
   }; */

  return {
    location,
    loading,
    // lastCheck,
    // refreshLocation,
    // Expose function to manually trigger location check
    // checkLocationChange: () => checkAndUpdateLocation(true),
  };
}

async function setUserLocationFnc() {
  try {
    const response = await fetch(`https://api.ipinfo.io/lite/me?token=${process.env.NEXT_PUBLIC_IPINFO_TOKEN}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Location detection failed:", error);
    return null;
  }
}
