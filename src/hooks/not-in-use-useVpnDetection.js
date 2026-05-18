"use client";
import { useEffect, useState, useCallback } from "react";
import { useGeoLocation } from "./useGeolocations";

export function useVpnDetection() {
   const { location, refreshLocation } = useGeoLocation();
   const [vpnStatus, setVpnStatus] = useState({
      isVpnDetected: false,
      previousLocation: null,
      suspiciousChanges: [],
      lastCheck: null
   });

   // Function to detect potential VPN usage based on location changes
   const detectVpnUsage = useCallback((currentLocation, previousLocation) => {
      if (!currentLocation || !previousLocation) return false;

      const suspiciousIndicators = [
         // IP address change to different country
         currentLocation.country !== previousLocation.country,
         // Extremely rapid location change (impossible travel)
         currentLocation.ip !== previousLocation.ip,
         // Change to known VPN/proxy data centers
         isKnownVpnLocation(currentLocation),
         // Sudden coordinate change that's impossible by normal travel
         isImpossibleTravel(currentLocation, previousLocation)
      ];

      return suspiciousIndicators.some(Boolean);
   }, []);

   // Function to check if location is known VPN/data center
   const isKnownVpnLocation = (location) => {
      const knownVpnIndicators = [
         // Common VPN hosting providers
         location.org?.toLowerCase().includes('vpn'),
         location.org?.toLowerCase().includes('hosting'),
         location.org?.toLowerCase().includes('data center'),
         location.org?.toLowerCase().includes('cloud'),
         // Common VPN countries
         ['Switzerland', 'Panama', 'British Virgin Islands', 'Belize'].includes(location.country),
         // ISP names that indicate hosting/VPN
         location.org?.toLowerCase().includes('digital ocean'),
         location.org?.toLowerCase().includes('aws'),
         location.org?.toLowerCase().includes('google cloud'),
         location.org?.toLowerCase().includes('microsoft azure')
      ];

      return knownVpnIndicators.some(Boolean);
   };

   // Function to detect impossible travel speeds
   const isImpossibleTravel = (currentLocation, previousLocation) => {
      if (!currentLocation.loc || !previousLocation.loc) return false;
      
      try {
         const [currLat, currLon] = currentLocation.loc.split(',').map(Number);
         const [prevLat, prevLon] = previousLocation.loc.split(',').map(Number);
         
         // Calculate distance in kilometers
         const distance = calculateDistance(prevLat, prevLon, currLat, currLon);
         
         // If distance > 1000km, likely VPN or plane travel
         return distance > 1000;
      } catch (error) {
         return false;
      }
   };

   // Calculate distance between two coordinates
   const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
   };

   // Check for VPN usage
   const checkVpnStatus = useCallback(async () => {
      const previousLocation = vpnStatus.previousLocation || location;
      
      if (location && previousLocation && location.ip !== previousLocation.ip) {
         const isVpn = detectVpnUsage(location, previousLocation);
         
         if (isVpn) {
            const suspiciousChange = {
               timestamp: new Date().toISOString(),
               from: {
                  ip: previousLocation.ip,
                  country: previousLocation.country,
                  city: previousLocation.city
               },
               to: {
                  ip: location.ip,
                  country: location.country,
                  city: location.city
               },
               indicators: getVpnIndicators(location, previousLocation)
            };

            setVpnStatus(prev => ({
               ...prev,
               isVpnDetected: true,
               suspiciousChanges: [...prev.suspiciousChanges, suspiciousChange],
               lastCheck: new Date().toISOString()
            }));

            console.warn("Potential VPN/Proxy change detected:", suspiciousChange);
         }
      }

      setVpnStatus(prev => ({
         ...prev,
         previousLocation: location,
         lastCheck: new Date().toISOString()
      }));
   }, [location, vpnStatus.previousLocation, detectVpnUsage]);

   // Get specific VPN indicators
   const getVpnIndicators = (current, previous) => {
      const indicators = [];
      
      if (current.country !== previous.country) {
         indicators.push('Country change');
      }
      
      if (current.ip !== previous.ip) {
         indicators.push('IP address change');
      }
      
      if (isKnownVpnLocation(current)) {
         indicators.push('Known VPN/Hosting location');
      }
      
      if (isImpossibleTravel(current, previous)) {
         indicators.push('Impossible travel distance');
      }
      
      return indicators;
   };

   // Monitor for location changes
   useEffect(() => {
      if (location) {
         checkVpnStatus();
      }
   }, [location, checkVpnStatus]);

   // Reset VPN detection
   const resetVpnDetection = useCallback(() => {
      setVpnStatus({
         isVpnDetected: false,
         previousLocation: location,
         suspiciousChanges: [],
         lastCheck: new Date().toISOString()
      });
   }, [location]);

   return {
      vpnStatus,
      isVpnDetected: vpnStatus.isVpnDetected,
      suspiciousChanges: vpnStatus.suspiciousChanges,
      resetVpnDetection,
      checkVpnStatus,
      refreshLocation
   };
}
